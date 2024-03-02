import React, { useEffect, useState } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { View, Text, StyleSheet, Button, TextInput, TouchableOpacity} from "react-native";
import * as Location from 'expo-location';

function PickUp({ navigation }) {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [places, setPlaces] = useState([]);
    const [pickup, setPickup] = useState('');

    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            Location.watchPositionAsync({
                accuracy: 6,
                distanceInterval: 1,
            }, (newLocation) => {
                setLocation(newLocation);
                console.log("🚀 ~ newLocation:", newLocation)
            });

        })();
    }, []);

    const searchLocation = (text) =>{
        const options = {
            method: 'GET',
            headers: {
              accept: 'application/json',
              Authorization: 'fsq3WHMGprK/+av7EmgdCAvnn1Qwm112bsOx/pmYmcyLiyg='
            }
          };

          const {latitude, longitude} = location.coords;

          fetch(`https://api.foursquare.com/v3/places/search?query=${text}&ll=${latitude},${longitude}&radius=3000`, options)
            .then(response => response.json())
            .then(response => {
                console.log(response)
                setPlaces(response.results)
            })
            .catch(err => console.error(err));
    }

    const onPlaceSelect = (item)=>{
        setPickup(item);
    }

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = JSON.stringify(location);
    }

    
    return (
        <>
            {location && (
                <View style={styles.container}>
                    {/* <Text>Pickup</Text> */}

                    <TextInput placeholder='Search' onChangeText={searchLocation} />

                    {places.map(item => {
                        return(
                            <TouchableOpacity onPress={() => onPlaceSelect(item)}>
                                <Text>{item.name},{item.location.address}</Text>
                            </TouchableOpacity>
                        )
                    })}

                    {pickup && <View>
                        <Text>Your selected location </Text>
                        <Text>{pickup.name}, {pickup.location.address}</Text>
                        </View>
                    }

                    {/* <Button
                        title="Destination"
                        onPress={() => navigation.navigate('Destination')}
                    /> */}

                    <MapView
                        showsMyLocationButton
                        showsUserLocation
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: 0.0001,
                            longitudeDelta: 0.0001,
                        }}>

                        <Marker
                            coordinate={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                            }}
                            title={"My location"}
                            description={"This is my marker description"} />

                    </MapView>
                </View>

            )}
        </>
    );
}

export default PickUp;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '90%',
        zIndex: 0
    },
});