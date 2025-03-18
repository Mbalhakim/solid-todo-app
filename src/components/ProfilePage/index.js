import React, { useState, useEffect } from "react";
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  getUrl,
  getUrlAll,
  getDatetime,
  getThingAll,
  getBoolean,
  asUrl,
  getTermAll,
} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";

function ProfilePage() {
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [trustedApps, setTrustedApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebugView, setShowDebugView] = useState(false);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    if (!session.info.isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        console.log("Fetching profile from", session.info.webId);
        
        // Fetch profile dataset
        const profileDataset = await getSolidDataset(session.info.webId, {
          fetch: session.fetch,
        });
        
        // Get the profile thing
        const profileThing = getThing(profileDataset, session.info.webId);
        
        if (!profileThing) {
          setError("Could not find profile data");
          return;
        }

        // Store raw data for debug view
        setRawData(profileThing);

        // Extract basic profile data
        const profileData = {
          webId: session.info.webId,
          name: getStringNoLocale(profileThing, "http://xmlns.com/foaf/0.1/name") || 
                getStringNoLocale(profileThing, "http://www.w3.org/2006/vcard/ns#fn") || 
                "No name available",
          displayName: getStringNoLocale(profileThing, "http://www.w3.org/2006/vcard/ns#fn"),
          nickname: getStringNoLocale(profileThing, "http://xmlns.com/foaf/0.1/nick"),
          note: getStringNoLocale(profileThing, "http://www.w3.org/2006/vcard/ns#note"),
          role: getStringNoLocale(profileThing, "http://www.w3.org/2006/vcard/ns#role"),
          organization: getStringNoLocale(profileThing, "http://www.w3.org/2006/vcard/ns#organization-name"),
          photo: getUrl(profileThing, "http://www.w3.org/2006/vcard/ns#hasPhoto"),
          podUrl: getUrl(profileThing, "http://www.w3.org/ns/pim/space#storage"),
          oidcIssuer: getUrl(profileThing, "http://www.w3.org/ns/solid/terms#oidcIssuer"),
          
          // Get pronouns
          pronouns: {
            subject: getStringNoLocale(profileThing, "http://www.w3.org/ns/solid/terms#preferredSubjectPronoun"),
            object: getStringNoLocale(profileThing, "http://www.w3.org/ns/solid/terms#preferredObjectPronoun"),
            relative: getStringNoLocale(profileThing, "http://www.w3.org/ns/solid/terms#preferredRelativePronoun"),
          },
          
          // Try to get birthday
          birthday: getDatetime(profileThing, "http://www.w3.org/2006/vcard/ns#bday"),
        };
        
        setProfile(profileData);
        
        // Get address information
        const addressUrls = getUrlAll(profileThing, "http://www.w3.org/2006/vcard/ns#hasAddress");
        if (addressUrls && addressUrls.length > 0) {
          const addressesData = [];
          
          for (const addressUrl of addressUrls) {
            const addressThing = getThing(profileDataset, addressUrl);
            if (addressThing) {
              addressesData.push({
                street: getStringNoLocale(addressThing, "http://www.w3.org/2006/vcard/ns#street-address"),
                locality: getStringNoLocale(addressThing, "http://www.w3.org/2006/vcard/ns#locality"),
                region: getStringNoLocale(addressThing, "http://www.w3.org/2006/vcard/ns#region"),
                postalCode: getStringNoLocale(addressThing, "http://www.w3.org/2006/vcard/ns#postal-code"),
                country: getStringNoLocale(addressThing, "http://www.w3.org/2006/vcard/ns#country-name"),
              });
            }
          }
          
          setAddresses(addressesData);
        }
        
        // 1. Get all things in the profile dataset
        const allThings = getThingAll(profileDataset);
        
        // 2. Find social media accounts
        const accountsData = [];
        for (const thing of allThings) {
          const thingUrl = asUrl(thing);
          
          // Skip the main profile
          if (thingUrl === session.info.webId) continue;
          
          // Check if it's a social media account
          try {
            // Check for account type (Instagram, TikTok, etc.)
            let accountType = null;
            
            if (getBoolean(thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://solidos.github.io/profile-pane/src/ontology/socialMedia.ttl#InstagramAccount")) {
              accountType = "Instagram";
            } else if (getBoolean(thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://solidos.github.io/profile-pane/src/ontology/socialMedia.ttl#TiktokAccount")) {
              accountType = "TikTok";
            } else if (getBoolean(thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://solidos.github.io/profile-pane/src/ontology/socialMedia.ttl#GithubAccount")) {
              accountType = "GitHub";
            } else if (getBoolean(thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://solidos.github.io/profile-pane/src/ontology/socialMedia.ttl#TwitterAccount")) {
              accountType = "Twitter";
            } else if (getBoolean(thing, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "https://solidos.github.io/profile-pane/src/ontology/socialMedia.ttl#LinkedInAccount")) {
              accountType = "LinkedIn";
            }
            
            if (accountType) {
              const username = getStringNoLocale(thing, "http://xmlns.com/foaf/0.1/accountName");
              if (username) {
                accountsData.push({
                  username,
                  type: accountType,
                  url: getAccountUrl(accountType, username)
                });
              }
            }
          } catch (e) {
            console.log("Not a social account", thingUrl);
          }
        }
        
        setSocialAccounts(accountsData);
        
        // 3. Get trusted apps
        const trustedAppsData = [];
        
        try {
          // Find blank nodes for trusted apps
          const appNodes = getTermAll(profileThing, "http://www.w3.org/ns/auth/acl#trustedApp");
          
          for (const node of appNodes) {
            try {
              const appThing = getThing(profileDataset, node);
              
              if (appThing) {
                const origin = getUrl(appThing, "http://www.w3.org/ns/auth/acl#origin");
                const modes = getUrlAll(appThing, "http://www.w3.org/ns/auth/acl#mode");
                
                if (origin) {
                  const appData = {
                    origin,
                    permissions: modes.map(mode => {
                      const parts = mode.split("#");
                      return parts[parts.length - 1]; // Extract just the permission name
                    })
                  };
                  
                  trustedAppsData.push(appData);
                }
              }
            } catch (e) {
              console.error("Error processing trusted app", e);
            }
          }
        } catch (e) {
          console.error("Error getting trusted apps", e);
        }
        
        setTrustedApps(trustedAppsData);
        
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(`Error fetching profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  // Helper function to generate social media account URLs
  const getAccountUrl = (type, username) => {
    switch (type) {
      case "Instagram":
        // Remove trailing slash if present
        const cleanUsername = username.endsWith("/") ? username.slice(0, -1) : username;
        return `https://instagram.com/${cleanUsername}`;
      case "TikTok":
        // Remove @ if present
        const tiktokUser = username.startsWith("@") ? username.substring(1) : username;
        return `https://tiktok.com/@${tiktokUser}`;
      case "GitHub":
        return `https://github.com/${username}`;
      case "Twitter":
        return `https://twitter.com/${username}`;
      case "LinkedIn":
        return `https://linkedin.com/in/${username}`;
      default:
        return null;
    }
  };

  // Function to format date
  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Function to get social media icon
  const getSocialIcon = (type) => {
    switch(type) {
      case "Instagram":
        return "📸";
      case "TikTok": 
        return "🎵";
      case "Twitter":
        return "🐦";
      case "LinkedIn":
        return "💼";
      case "GitHub":
        return "🧑‍💻";
      default:
        return "🔗";
    }
  };

  if (!session.info.isLoggedIn) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
        <p className="text-yellow-700">
          You need to log in to view your profile.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      {/* Header with profile name */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
        <button 
          onClick={() => setShowDebugView(!showDebugView)}
          className="absolute right-4 top-4 bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium"
        >
          {showDebugView ? "Normal View" : "Debug View"}
        </button>

        <div className="flex items-center space-x-4">
          {profile?.photo && (
            <img 
              src={profile.photo} 
              alt="Profile" 
              className="h-20 w-20 rounded-full border-4 border-white shadow-md object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{profile?.name}</h2>
            {profile?.nickname && (
              <p className="text-blue-100">@{profile.nickname}</p>
            )}
            {profile?.pronouns?.subject && (
              <div className="mt-1 bg-blue-500 bg-opacity-30 rounded-full px-3 py-1 text-sm inline-flex">
                {profile.pronouns.subject}/{profile.pronouns.object}/{profile.pronouns.relative}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showDebugView ? (
        // DEBUG VIEW
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Profile Data (Raw)</h3>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify({
                profile,
                addresses,
                socialAccounts,
                trustedApps
              }, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        // NORMAL VIEW
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Personal Information */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">Personal Information</h3>
                </div>
                <div className="p-4 space-y-3">
                  {profile?.role && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p>{profile.role}</p>
                    </div>
                  )}
                  
                  {profile?.organization && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Organization</p>
                      <p>{profile.organization}</p>
                    </div>
                  )}
                  
                  {profile?.birthday && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Birthday</p>
                      <p>{formatDate(profile.birthday)}</p>
                    </div>
                  )}
                  
                  {profile?.note && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Note</p>
                      <p className="bg-yellow-50 p-2 rounded text-sm">{profile.note}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Social Media Accounts */}
              {socialAccounts.length > 0 && (
                <div className="mt-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Social Media</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-2">
                      {socialAccounts.map((account, index) => (
                        <a 
                          key={index} 
                          href={account.url} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-2 hover:bg-gray-50 rounded-md"
                        >
                          <span className="text-xl mr-3">{getSocialIcon(account.type)}</span>
                          <div>
                            <div className="font-medium text-blue-600">{account.type}</div>
                            <div className="text-sm text-gray-500">{account.username}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Column 2: Addresses and Solid Pod Details */}
            <div className="md:col-span-2">
              {/* Addresses */}
              {addresses.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Addresses</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {addresses.map((address, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                          <p className="font-medium">{address.street}</p>
                          <p className="text-gray-600">
                            {[
                              address.locality, 
                              address.region, 
                              address.postalCode, 
                              address.country
                            ].filter(Boolean).join(", ")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Trusted Applications */}
              {trustedApps.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-800">Trusted Applications</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {trustedApps.map((app, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
                          <div className="flex items-center">
                            <div className="mr-2 bg-green-100 text-green-700 p-1 rounded">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                            </div>
                            <a href={app.origin} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">
                              {app.origin.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {app.permissions.map((permission, i) => (
                              <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Solid Pod Details */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-800">Solid Pod Details</h3>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">WebID</p>
                      <a href={profile?.webId} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {profile?.webId}
                      </a>
                    </div>
                    
                    {profile?.podUrl && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Pod URL</p>
                        <a href={profile.podUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                          {profile.podUrl}
                        </a>
                      </div>
                    )}
                    
                    {profile?.oidcIssuer && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Identity Provider</p>
                        <a href={profile.oidcIssuer} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {profile.oidcIssuer}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;