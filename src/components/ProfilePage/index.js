import React, { useState, useEffect } from "react";
import {
  getSolidDataset,
  getThing,
  getStringNoLocale,
  getUrl,
  getUrlAll,
} from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";

// Define RDF predicates as constants
const FOAF = {
  name: "http://xmlns.com/foaf/0.1/name",
  nick: "http://xmlns.com/foaf/0.1/nick",
  type: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
  person: "http://xmlns.com/foaf/0.1/Person",
};

const VCARD = {
  fn: "http://www.w3.org/2006/vcard/ns#fn",
  hasPhoto: "http://www.w3.org/2006/vcard/ns#hasPhoto",
  hasAddress: "http://www.w3.org/2006/vcard/ns#hasAddress",
  note: "http://www.w3.org/2006/vcard/ns#note",
  orgName: "http://www.w3.org/2006/vcard/ns#organization-name",
  role: "http://www.w3.org/2006/vcard/ns#role",
};

const SOLID = {
  storage: "http://www.w3.org/ns/pim/space#storage",
  account: "http://www.w3.org/ns/solid/terms#account",
  oidcIssuer: "http://www.w3.org/ns/solid/terms#oidcIssuer",
  privateTypeIndex: "http://www.w3.org/ns/solid/terms#privateTypeIndex",
  publicTypeIndex: "http://www.w3.org/ns/solid/terms#publicTypeIndex",
  preferencesFile: "http://www.w3.org/ns/pim/space#preferencesFile",
  inbox: "http://www.w3.org/ns/ldp#inbox",
};

function ProfilePage() {
  const { session } = useSession();
  const [profile, setProfile] = useState(null);
  const [rawData, setRawData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDebugView, setShowDebugView] = useState(false);

  useEffect(() => {
    if (!session.info.isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        
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

        // Extract all raw data - this will be available in debug view
        setRawData({
          // Types
          type: getUrlAll(profileThing, FOAF.type),
          
          // Basic Info
          name: getStringNoLocale(profileThing, FOAF.name),
          fn: getStringNoLocale(profileThing, VCARD.fn),
          nick: getStringNoLocale(profileThing, FOAF.nick),
          
          // Professional Info
          role: getStringNoLocale(profileThing, VCARD.role),
          orgName: getStringNoLocale(profileThing, VCARD.orgName),
          note: getStringNoLocale(profileThing, VCARD.note),
          
          // Photos and Media
          photos: getUrlAll(profileThing, VCARD.hasPhoto),
          
          // Address Information
          addresses: getUrlAll(profileThing, VCARD.hasAddress),
          
          // Solid-specific Information
          storage: getUrlAll(profileThing, SOLID.storage),
          account: getUrl(profileThing, SOLID.account),
          oidcIssuer: getUrl(profileThing, SOLID.oidcIssuer),
          privateTypeIndex: getUrl(profileThing, SOLID.privateTypeIndex),
          publicTypeIndex: getUrl(profileThing, SOLID.publicTypeIndex),
          preferencesFile: getUrl(profileThing, SOLID.preferencesFile),
          inbox: getUrl(profileThing, SOLID.inbox),
        });
        
        // Create a structured profile object
        setProfile({
          webId: session.info.webId,
          name: getStringNoLocale(profileThing, FOAF.name) || 
                getStringNoLocale(profileThing, VCARD.fn) || 
                "No name available",
          displayName: getStringNoLocale(profileThing, VCARD.fn),
          nickname: getStringNoLocale(profileThing, FOAF.nick),
          note: getStringNoLocale(profileThing, VCARD.note),
          role: getStringNoLocale(profileThing, VCARD.role),
          organization: getStringNoLocale(profileThing, VCARD.orgName),
          photo: getUrlAll(profileThing, VCARD.hasPhoto)[0],
          additionalPhotos: getUrlAll(profileThing, VCARD.hasPhoto).slice(1),
          addresses: getUrlAll(profileThing, VCARD.hasAddress),
          podUrl: getUrl(profileThing, SOLID.storage),
          inbox: getUrl(profileThing, SOLID.inbox),
          oidcIssuer: getUrl(profileThing, SOLID.oidcIssuer),
        });
        
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(`Error fetching profile: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

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
      {/* Header with profile name and toggle button */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{profile?.name}</h2>
          {profile?.nickname && (
            <p className="text-blue-100">{profile.nickname}</p>
          )}
        </div>
        <button 
          onClick={() => setShowDebugView(!showDebugView)}
          className="bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded text-sm font-medium"
        >
          {showDebugView ? "Normal View" : "Debug View"}
        </button>
      </div>
      
      {showDebugView ? (
        // DEBUG VIEW
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4">Raw Profile Data</h3>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 overflow-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(rawData, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        // NORMAL VIEW
        <div className="p-6">
          {/* Main sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Profile picture and basic info */}
            <div className="md:col-span-1">
              {profile?.photo ? (
                <div className="mb-6">
                  <img 
                    src={profile.photo} 
                    alt="Profile" 
                    className="rounded-lg w-full shadow-md border-2 border-gray-200" 
                  />
                </div>
              ) : (
                <div className="mb-6 bg-gray-200 rounded-lg p-8 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              
              <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">WebID</h3>
                <a 
                  href={profile?.webId} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  {profile?.webId}
                </a>
              </div>
              
              {profile?.oidcIssuer && (
                <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
                  <h3 className="font-semibold text-indigo-800 mb-2">Identity Provider</h3>
                  <a 
                    href={profile.oidcIssuer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:underline"
                  >
                    {profile.oidcIssuer}
                  </a>
                </div>
              )}
            </div>
            
            {/* Column 2: Personal and professional details */}
            <div className="md:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                    <dd className="mt-1">{profile?.name}</dd>
                  </div>
                  
                  {profile?.displayName && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                      <dd className="mt-1">{profile.displayName}</dd>
                    </div>
                  )}
                  
                  {profile?.nickname && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Nickname</dt>
                      <dd className="mt-1">{profile.nickname}</dd>
                    </div>
                  )}
                </dl>
              </div>
              
              {/* Professional Information */}
              {(profile?.role || profile?.organization || profile?.note) && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-xl font-semibold mb-4">Professional Information</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    {profile?.role && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Role</dt>
                        <dd className="mt-1">{profile.role}</dd>
                      </div>
                    )}
                    
                    {profile?.organization && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Organization</dt>
                        <dd className="mt-1">{profile.organization}</dd>
                      </div>
                    )}
                  </dl>
                  
                  {profile?.note && (
                    <div className="mt-4">
                      <dt className="text-sm font-medium text-gray-500">Note</dt>
                      <dd className="mt-1 bg-gray-50 p-3 rounded">{profile.note}</dd>
                    </div>
                  )}
                </div>
              )}
              
              {/* Pod Information */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Solid Pod Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  {profile?.podUrl && (
                    <div className="bg-green-50 p-3 rounded-md flex items-center border border-green-100">
                      <div className="mr-3 rounded-full bg-green-100 p-2">
                        <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-green-800">Pod Storage</h4>
                        <a href={profile.podUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
                          {profile.podUrl}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {profile?.inbox && (
                    <div className="bg-yellow-50 p-3 rounded-md flex items-center border border-yellow-100">
                      <div className="mr-3 rounded-full bg-yellow-100 p-2">
                        <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Inbox</h4>
                        <a href={profile.inbox} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline text-sm">
                          {profile.inbox}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Additional Photos */}
              {profile?.additionalPhotos && profile.additionalPhotos.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Additional Photos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {profile.additionalPhotos.map((photo, index) => (
                      <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100">
                        <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-40 object-cover" />
                        <a 
                          href={photo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity"
                        >
                          <span className="text-transparent hover:text-white">View Full</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;