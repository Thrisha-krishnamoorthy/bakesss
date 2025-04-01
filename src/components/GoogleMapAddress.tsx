import { useState, useCallback, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from './ui/use-toast';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Default location (Bangalore)
const defaultCenter = {
  lat: 12.9716,
  lng: 77.5946
};

// Detailed locations with complete address information
const detailedLocations = [
  { 
    name: 'Chennai Central', 
    lat: 13.0827, 
    lng: 80.2707, 
    street: '23 Gandhi Irwin Road',
    city: 'Chennai',
    state: 'Tamil Nadu', 
    postalCode: '600003' 
  },
  { 
    name: 'Chennai T. Nagar', 
    lat: 13.0418, 
    lng: 80.2341, 
    street: '42 Usman Road',
    city: 'Chennai',
    state: 'Tamil Nadu', 
    postalCode: '600017' 
  },
  { 
    name: 'Mumbai Andheri', 
    lat: 19.1136, 
    lng: 72.8697, 
    street: '15 Veera Desai Road',
    city: 'Mumbai',
    state: 'Maharashtra', 
    postalCode: '400053' 
  },
  { 
    name: 'Mumbai Colaba', 
    lat: 18.9067, 
    lng: 72.8147, 
    street: '78 Shahid Bhagat Singh Road',
    city: 'Mumbai',
    state: 'Maharashtra', 
    postalCode: '400005' 
  },
  { 
    name: 'Delhi Connaught Place', 
    lat: 28.6315, 
    lng: 77.2167, 
    street: '12 Rajiv Chowk',
    city: 'New Delhi',
    state: 'Delhi', 
    postalCode: '110001' 
  },
  { 
    name: 'Delhi Hauz Khas', 
    lat: 28.5494, 
    lng: 77.2001, 
    street: '35 Aurobindo Marg',
    city: 'New Delhi',
    state: 'Delhi', 
    postalCode: '110016' 
  },
  { 
    name: 'Bangalore Indiranagar', 
    lat: 12.9784, 
    lng: 77.6408, 
    street: '100 Feet Road',
    city: 'Bangalore',
    state: 'Karnataka', 
    postalCode: '560038' 
  },
  { 
    name: 'Bangalore Koramangala', 
    lat: 12.9279, 
    lng: 77.6271, 
    street: '80 Feet Road',
    city: 'Bangalore',
    state: 'Karnataka', 
    postalCode: '560034' 
  },
  { 
    name: 'Hyderabad Banjara Hills', 
    lat: 17.4156, 
    lng: 78.4347, 
    street: 'Road No. 12',
    city: 'Hyderabad',
    state: 'Telangana', 
    postalCode: '500034' 
  },
  { 
    name: 'Hyderabad Jubilee Hills', 
    lat: 17.4275, 
    lng: 78.4099, 
    street: 'Road No. 36',
    city: 'Hyderabad',
    state: 'Telangana', 
    postalCode: '500033' 
  }
];

// Group locations by city
const locationsByCity = detailedLocations.reduce((acc, location) => {
  const city = location.city;
  if (!acc[city]) {
    acc[city] = [];
  }
  acc[city].push(location);
  return acc;
}, {} as Record<string, typeof detailedLocations>);

interface GoogleMapAddressProps {
  apiKey: string;
  onAddressSelect: (address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    lat: number;
    lng: number;
    name?: string;
  }) => void;
  initialAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    lat: number;
    lng: number;
  };
}

const GoogleMapAddress: React.FC<GoogleMapAddressProps> = ({ apiKey, onAddressSelect, initialAddress }) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [marker, setMarker] = useState<google.maps.LatLngLiteral>({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore
  const [street, setStreet] = useState(initialAddress?.street || '');
  const [city, setCity] = useState(initialAddress?.city || '');
  const [state, setState] = useState(initialAddress?.state || '');
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode || '');
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [infoContent, setInfoContent] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [retryCount, setRetryCount] = useState(0);
  
  // Load initial address if provided
  useEffect(() => {
    if (initialAddress) {
      setStreet(initialAddress.street || '');
      setCity(initialAddress.city || '');
      setState(initialAddress.state || '');
      setPostalCode(initialAddress.postalCode || '');
      
      if (initialAddress.lat && initialAddress.lng) {
        setMarker({ lat: initialAddress.lat, lng: initialAddress.lng });
      }
    }
  }, [initialAddress]);
  
  // Automatically get current location when the component mounts
  useEffect(() => {
    // Wait a bit for the map and geocoder to initialize
    const timer = setTimeout(() => {
      if (map && geocoder) {
        getCurrentLocation();
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [map, geocoder]);

  // Initialize geocoder when Google Maps is loaded
  useEffect(() => {
    if (window.google && !geocoder) {
      const newGeocoder = new window.google.maps.Geocoder();
      setGeocoder(newGeocoder);
    }
  }, [geocoder]);

  // Retry mechanism for geocoder initialization
  useEffect(() => {
    if (!geocoder && retryCount < 5) {
      const timer = setTimeout(() => {
        if (window.google) {
          const newGeocoder = new window.google.maps.Geocoder();
          setGeocoder(newGeocoder);
        }
        setRetryCount(prev => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [geocoder, retryCount]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
      setMarker(pos);
      setShowInfoWindow(true);
      
      // Set the coordinates immediately to ensure we have them
      setInfoContent(`Location: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`);
      
      // Always update the parent with the coordinates, even before geocoding completes
      updateParentComponent({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        lat: pos.lat,
        lng: pos.lng,
        name: 'Selected Location'
      });
      
      if (geocoder) {
        setIsLocating(true);
        geocoder.geocode({ location: pos }, (results, status) => {
          setIsLocating(false);
          if (status === 'OK' && results?.[0]) {
            const address = results[0];
            setInfoContent(address.formatted_address);
            
            // Extract address components with improved handling
            let streetNumber = '';
            let route = '';
            let neighborhood = '';
            let sublocality = '';
            let locality = '';
            let administrative_area = '';
            let postal_code = '';
            
            for (const component of address.address_components) {
              const types = component.types;
              if (types.includes('street_number')) {
                streetNumber = component.long_name;
              } else if (types.includes('route')) {
                route = component.long_name;
              } else if (types.includes('neighborhood')) {
                neighborhood = component.long_name;
              } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                sublocality = component.long_name;
              } else if (types.includes('locality')) {
                locality = component.long_name;
              } else if (types.includes('administrative_area_level_1')) {
                administrative_area = component.long_name;
              } else if (types.includes('postal_code')) {
                postal_code = component.long_name;
              }
            }
            
            // Construct a more complete street address
            let streetAddress = '';
            if (streetNumber && route) {
              streetAddress = `${streetNumber} ${route}`;
            } else if (route) {
              streetAddress = route;
            } else if (neighborhood) {
              streetAddress = neighborhood;
            } else if (sublocality) {
              streetAddress = sublocality;
            } else {
              // Use the first line of the formatted address as a fallback
              const addressParts = address.formatted_address.split(',');
              if (addressParts.length > 0) {
                streetAddress = addressParts[0].trim();
              }
            }
            
            // Set the address fields
            setStreet(streetAddress);
            setCity(locality || '');
            setState(administrative_area || '');
            setPostalCode(postal_code || '');
            
            console.log('Geocoded address:', {
              streetAddress,
              locality,
              administrative_area,
              postal_code,
              formatted: address.formatted_address
            });
            
            // Update parent with both coordinates and address info
            updateParentComponent({
              street: streetAddress,
              city: locality || '',
              state: administrative_area || '',
              postalCode: postal_code || '',
              lat: pos.lat,
              lng: pos.lng,
              name: 'Selected Location'
            });
          } else {
            console.error('Geocoding failed:', status);
            // Keep the coordinates but show an error message
            setInfoContent(`Location: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)} (Unable to get address)`);
          }
        });
      } else {
        // Keep using the coordinates
        setInfoContent(`Location: ${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)} (No geocoder available)`);
      }
    }
  };

  const findClosestLocation = (position: { lat: number, lng: number }) => {
    let closestLocation = null;
    let closestDistance = Number.MAX_VALUE;
    
    detailedLocations.forEach(location => {
      const distance = calculateDistance(
        position.lat, position.lng,
        location.lat, location.lng
      );
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestLocation = location;
      }
    });
    
    return closestLocation;
  };
  
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    // Simple Euclidean distance for demonstration
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
  };

  const selectLocation = (locationName: string) => {
    const location = detailedLocations.find(loc => loc.name === locationName);
    if (!location) return;
    
    const pos = { lat: location.lat, lng: location.lng };
    setMarker(pos);
    map?.setCenter(pos);
    map?.setZoom(16);
    
    // Set address directly from our data
    setStreet(location.street);
    setCity(location.city);
    setState(location.state);
    setPostalCode(location.postalCode);
    setInfoContent(`${location.street}, ${location.city}, ${location.state} ${location.postalCode}`);
    setShowInfoWindow(true);
    
    updateParentComponent(location);
  };
  
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setMarker(pos);
          map?.setCenter(pos);
          map?.setZoom(16);
          setShowInfoWindow(true);
          
          // Set the coordinates immediately while we wait for geocoding
          setInfoContent("Getting address details...");
          
          // Make sure Google Maps is loaded and geocoder is available
          if (window.google && (!geocoder || !map)) {
            const newGeocoder = new window.google.maps.Geocoder();
            setGeocoder(newGeocoder);
          }
          
          if (geocoder) {
            geocoder.geocode({ location: pos }, (results, status) => {
              setIsLocating(false);
              if (status === 'OK' && results?.[0]) {
                const address = results[0];
                setInfoContent(address.formatted_address);
                
                // Extract address components
                let streetNumber = '';
                let route = '';
                let neighborhood = '';
                let sublocality = '';
                let locality = '';
                let administrative_area = '';
                let postal_code = '';
                
                for (const component of address.address_components) {
                  const types = component.types;
                  if (types.includes('street_number')) {
                    streetNumber = component.long_name;
                  } else if (types.includes('route')) {
                    route = component.long_name;
                  } else if (types.includes('neighborhood')) {
                    neighborhood = component.long_name;
                  } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
                    sublocality = component.long_name;
                  } else if (types.includes('locality')) {
                    locality = component.long_name;
                  } else if (types.includes('administrative_area_level_1')) {
                    administrative_area = component.long_name;
                  } else if (types.includes('postal_code')) {
                    postal_code = component.long_name;
                  }
                }
                
                // Construct a more complete street address
                let streetAddress = '';
                if (streetNumber && route) {
                  streetAddress = `${streetNumber} ${route}`;
                } else if (route) {
                  streetAddress = route;
                } else if (neighborhood) {
                  streetAddress = neighborhood;
                } else if (sublocality) {
                  streetAddress = sublocality;
                } else {
                  // Use the first line of the formatted address as a fallback
                  const addressParts = address.formatted_address.split(',');
                  if (addressParts.length > 0) {
                    streetAddress = addressParts[0].trim();
                  }
                }
                
                // Set the address fields
                setStreet(streetAddress);
                setCity(locality || '');
                setState(administrative_area || '');
                setPostalCode(postal_code || '');
                
                // Update parent with both coordinates and address info
                const updatedAddress = {
                  street: streetAddress,
                  city: locality || '',
                  state: administrative_area || '',
                  postalCode: postal_code || '',
                  lat: pos.lat,
                  lng: pos.lng,
                  name: 'Current Location'
                };
                
                // Update the parent component
                onAddressSelect(updatedAddress);
                
                // Update the selected address display
                setInfoContent(`${streetAddress}, ${locality}, ${administrative_area} ${postal_code}`);
              } else {
                console.error('Geocoding failed:', status);
                setIsLocating(false);
                // Silently continue without showing an error toast
              }
            });
          } else if (retryCount < 5) {
            // If geocoder is not available, increment retry count and try again
            setRetryCount(prev => prev + 1);
            setTimeout(getCurrentLocation, 1000);
          } else {
            setIsLocating(false);
            // After 5 retries, silently fail and let user select location manually
            console.log('Unable to initialize Google Maps after retries');
          }
        },
        (error) => {
          setIsLocating(false);
          console.error('Error getting location:', error);
          toast({
            title: 'Location Error',
            description: 'Unable to get your location. Please select a location from the map or enter it manually.',
            variant: 'destructive',
          });
        },
        { 
          enableHighAccuracy: true, 
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    } else {
      toast({
        title: 'Browser Error',
        description: 'Geolocation is not supported by your browser. Please select a location from the map or enter it manually.',
        variant: 'destructive',
      });
    }
  };
  
  const updateParentComponent = (location?: typeof detailedLocations[0]) => {
    onAddressSelect({
      street: location?.street || street,
      city: location?.city || city,
      state: location?.state || state,
      postalCode: location?.postalCode || postalCode,
      lat: location?.lat || marker.lat,
      lng: location?.lng || marker.lng,
      name: location?.name
    });
  };
  
  // Update parent component whenever address fields change
  useEffect(() => {
    if (street || city || state || postalCode) {
      updateParentComponent();
    }
  }, [street, city, state, postalCode]);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="map" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={getCurrentLocation} 
              className="flex items-center gap-2 w-full"
              disabled={isLocating}
            >
              {isLocating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Use Current Location
                </>
              )}
            </Button>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-md mb-4">
            <p className="text-sm flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-blue-500" />
              Click on the map or use the button above to set your delivery address
            </p>
          </div>
          
          <div className="relative">
            <LoadScript googleMapsApiKey={apiKey}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={marker}
                zoom={15}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={{
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                  gestureHandling: 'greedy',
                }}
              >
                <Marker 
                  position={marker}
                  onClick={() => {
                    if (infoContent) {
                      setShowInfoWindow(true);
                    }
                  }}
                >
                  {showInfoWindow && infoContent && (
                    <InfoWindow
                      onCloseClick={() => setShowInfoWindow(false)}
                    >
                      <div className="text-black text-sm p-1 max-w-[250px]">
                        {infoContent}
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              </GoogleMap>
            </LoadScript>
            
            {isLocating && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="bg-white p-4 rounded-md shadow-md flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Fetching location...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="font-medium mb-2">Selected Address</h3>
            {street ? (
              <>
                <p className="text-sm">{street}</p>
                <p className="text-sm">{city}, {state} {postalCode}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No address selected</p>
            )}
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('manual')}
                className="text-xs"
              >
                Edit Address Details
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <div className="p-3 bg-yellow-50 rounded-md mb-4">
            <p className="text-sm">
              Enter your address details manually or edit the address selected from the map.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Street Address</label>
              <Input 
                value={street} 
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Street address, house number, etc."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">State</label>
                <Input 
                  value={state} 
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">Postal Code</label>
              <Input 
                value={postalCode} 
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="Postal Code"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={() => setActiveTab('map')}
                className="w-full"
              >
                Save and Return to Map
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoogleMapAddress;
