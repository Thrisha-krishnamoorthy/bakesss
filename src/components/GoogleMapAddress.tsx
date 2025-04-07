import { useState, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from './ui/use-toast';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Add required styles for the map
const mapStyles = {
  width: '100%',
  height: '400px',
  zIndex: 0
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

interface MapAddressProps {
  onAddressSelect: (address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    lat: number;
    lng: number;
    name?: string;
    mapLink: string;
  }) => void;
  initialAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    lat: number;
    lng: number;
    mapLink?: string;
  };
}

// Component to handle map events and updates
function MapEvents({ onMapClick }: { onMapClick: (e: L.LeafletMouseEvent) => void }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [map, onMapClick]);
  return null;
}

// Add this new component for map center control
function MapCenterControl({ center }: { center: L.LatLng }) {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 13);
    }
  }, [center, map]);

  return null;
}

const MapAddress: React.FC<MapAddressProps> = ({ onAddressSelect, initialAddress }) => {
  const [marker, setMarker] = useState<L.LatLng | null>(
    initialAddress ? L.latLng(initialAddress.lat, initialAddress.lng) : null
  );
  const [street, setStreet] = useState(initialAddress?.street || '');
  const [city, setCity] = useState(initialAddress?.city || '');
  const [state, setState] = useState(initialAddress?.state || '');
  const [postalCode, setPostalCode] = useState(initialAddress?.postalCode || '');
  const [isLocating, setIsLocating] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [popupContent, setPopupContent] = useState('');

  // Load initial address if provided
  useEffect(() => {
    if (initialAddress) {
      setStreet(initialAddress.street || '');
      setCity(initialAddress.city || '');
      setState(initialAddress.state || '');
      setPostalCode(initialAddress.postalCode || '');
      setMarker(L.latLng(initialAddress.lat, initialAddress.lng));
    }
  }, [initialAddress]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      
      if (data.address) {
        const {
          road,
          house_number,
          suburb,
          city: cityName,
          state: stateName,
          postcode,
          town,
          village
        } = data.address;

        // Construct street address
        let streetAddress = '';
        if (house_number && road) {
          streetAddress = `${house_number} ${road}`;
        } else if (road) {
          streetAddress = road;
        } else if (suburb) {
          streetAddress = suburb;
        }

        // Set address components
        setStreet(streetAddress);
        setCity(cityName || town || village || '');
        setState(stateName || '');
        setPostalCode(postcode || '');
        setPopupContent(data.display_name);

        // Update parent component
        updateParentComponent({
          street: streetAddress,
          city: cityName || town || village || '',
          state: stateName || '',
          postalCode: postcode || '',
          lat,
          lng,
          name: 'Selected Location',
          mapLink: `https://www.google.com/maps?q=${lat},${lng}`
        });
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      toast({
        title: 'Address Lookup Failed',
        description: 'Unable to get address details for this location.',
        variant: 'destructive',
      });
    }
  };

  const handleMapClick = useCallback((e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setMarker(e.latlng);
    reverseGeocode(lat, lng);
  }, []);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          const newMarker = L.latLng(lat, lng);
          setMarker(newMarker);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            if (data.address) {
              const {
                road,
                house_number,
                suburb,
                city: cityName,
                state: stateName,
                postcode,
                town,
                village
              } = data.address;

              // Construct street address
              let streetAddress = '';
              if (house_number && road) {
                streetAddress = `${house_number} ${road}`;
              } else if (road) {
                streetAddress = road;
              } else if (suburb) {
                streetAddress = suburb;
              }

              const finalCity = cityName || town || village || '';
              const finalState = stateName || '';
              const finalPostcode = postcode || '';

              // Update all address fields
              setStreet(streetAddress);
              setCity(finalCity);
              setState(finalState);
              setPostalCode(finalPostcode);
              setPopupContent(data.display_name);

              // Update parent component with complete address
              onAddressSelect({
                street: streetAddress,
                city: finalCity,
                state: finalState,
                postalCode: finalPostcode,
                lat,
                lng,
                name: 'Current Location',
                mapLink: `https://www.google.com/maps?q=${lat},${lng}`
              });
            }
          } catch (error) {
            console.error('Reverse geocoding failed:', error);
            toast({
              title: 'Address Lookup Failed',
              description: 'Unable to get address details for this location. Please try selecting manually.',
              variant: 'destructive',
            });
          } finally {
            setIsLocating(false);
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
    if (!marker && !location) return;
    
    // Generate map link using Google Maps format
    const mapLink = location ? 
      `https://www.google.com/maps?q=${location.lat},${location.lng}` :
      `https://www.google.com/maps?q=${marker!.lat},${marker!.lng}`;
    
    onAddressSelect({
      street: location?.street || street,
      city: location?.city || city,
      state: location?.state || state,
      postalCode: location?.postalCode || postalCode,
      lat: location?.lat || marker!.lat,
      lng: location?.lng || marker!.lng,
      name: location?.name,
      mapLink: mapLink
    });
  };

  // Update parent component whenever address fields change
  useEffect(() => {
    if (street || city || state || postalCode) {
      updateParentComponent();
    }
  }, [street, city, state, postalCode]);

  const handleUpdateAddress = () => {
    if (!street || !city || !state || !postalCode) {
      toast({
        title: "Incomplete Address",
        description: "Please fill in all address fields before updating.",
        variant: "destructive"
      });
      return;
    }

    if (!marker) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map.",
        variant: "destructive"
      });
      return;
    }

    const mapLink = `https://www.google.com/maps?q=${marker.lat},${marker.lng}`;
    
    onAddressSelect({
      street,
      city,
      state,
      postalCode,
      lat: marker.lat,
      lng: marker.lng,
      mapLink
    });

    toast({
      title: "Address Updated",
      description: "Your delivery address has been updated successfully.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleUpdateAddress();
    }
  };

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
          
          <div className="relative h-[400px] w-full">
            <MapContainer
              center={marker ? [marker.lat, marker.lng] : [defaultCenter.lat, defaultCenter.lng]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <MapEvents onMapClick={handleMapClick} />
              {marker && (
                <>
                  <MapCenterControl center={marker} />
                  <Marker position={[marker.lat, marker.lng]}>
                    {popupContent && (
                      <Popup>
                        <div className="text-sm p-1 max-w-[250px]">
                          {popupContent}
                        </div>
                      </Popup>
                    )}
                  </Marker>
                </>
              )}
            </MapContainer>
            
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
                onChange={(e) => {
                  const newPostalCode = e.target.value;
                  setPostalCode(newPostalCode);
                  // Update parent component immediately when postal code changes
                  updateParentComponent({
                    street,
                    city,
                    state,
                    postalCode: newPostalCode,
                    lat: marker ? marker.lat : 0,
                    lng: marker ? marker.lng : 0,
                    mapLink: marker ? `https://www.google.com/maps?q=${marker.lat},${marker.lng}` : ''
                  });
                }}
                onKeyDown={handleKeyDown}
                placeholder="Postal Code"
                className="w-full p-4 rounded-lg border border-border text-lg"
                required
              />
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleUpdateAddress}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                Update Delivery Address
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MapAddress;
