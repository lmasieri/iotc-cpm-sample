import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import ApplicationBar from '../components/appbar';
import { ItemData } from '../models';
import DefaultStyles from '../styles';
import { Footer } from '../components/footer';
import VitalsLogo from '../assets/vitals_logo.svg';
import { Detail, Headline, Name } from '../components/typography';
import { LineChart } from 'react-native-charts-wrapper';
import { Loading, getRandomColor } from '../components/utils';
import { ReactDispatch, DrawerProperty, ExtendedLineData } from '../types';
import { useNavigation } from '@react-navigation/native';
import { ConfigContext } from '../contexts/config';
import { bleToIoTCName } from '../utils';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { IconButton } from 'react-native-paper';



const title = 'Health insights';
const summary = 'Your average body temperature is less than yesterday and your heart rate is nearly the same.';
const footer = 'This view is showing real-time data from the paired device or Google Fit data. To restart this sample walkthrough, exit and relaunch the app. To get started with building your own app, visit our GitHub repository.';




export default function Insight() {
    const { state, dispatch } = useContext(ConfigContext);
    const [start, setStart] = useState<number>(Date.now());
    const drawer = useNavigation<DrawerProperty>();
    const [data, setData] = useState<ExtendedLineData>({
        dataSets: []
    });
    const timestamp = Date.now() - start;

    /**
 * 
 * @param itemdata Current sample for the item
 * @param startTime Start time of the sampling. Must be the same value used as "since" param in the chart
 * @param setData Dispatch to update dataset with current sample
 */
    function updateData(itemdata: ItemData) {
        if (state.centralClient && state.centralClient.isConnected()) {
            state.centralClient.sendTelemetry({ [bleToIoTCName(itemdata.itemId)]: itemdata.value });
        }

        setData(currentDataSet => {
            let currentItemData = currentDataSet.dataSets.find(d => d.itemId === itemdata.itemId);

            // Current sample time (x-axis) is the difference between current timestamp e the start time of sampling
            const newSample = { x: Date.now() - start, y: itemdata.value };

            if (!currentItemData) {
                // current item is not in the dataset yet
                return { ...currentDataSet, dataSets: [...currentDataSet.dataSets, ...[{ itemId: itemdata.itemId, values: [newSample], label: itemdata.itemName ? itemdata.itemName : itemdata.itemId, config: { color: getRandomColor() } }]] };
            }
            return {
                ...currentDataSet,
                dataSets: currentDataSet.dataSets.map(({ ...item }) => {
                    if (item.itemId === itemdata.itemId && item.values) {
                        item.values = [...item.values, ...[newSample]];
                    }
                    return item;
                })
            }
        });

    }

    useEffect(() => {
        setStart(Date.now());
        drawer.setParams({
            title: 'Health Insight'
        });
        dispatch({
            type: 'SET',
            payload: {
                right: () => {
                    drawer.openDrawer();
                }
            }
        });
        /**
         * Setup the update function in the context.
         * This way the drawer can manage enabled/disabled items and "onDataAvailable" for them
         */
        dispatch({
            type: 'UPDATE',
            payload: updateData
        })
        drawer.openDrawer();
    }, []);

    /**
     * Manage component unmount. Remove all listeners
     */
    useEffect(() => {
        const unsubscribe = drawer.addListener('blur', async () => {
            if (state.device) {
                await state.device.disconnect();

                // send disconnection event
                dispatch({
                    type: 'DISCONNECT',
                    payload: null
                });

                // send 
                dispatch({
                    type: 'UPDATE',
                    payload: null
                })
            }
        });
        return unsubscribe;
    }, [drawer, state, dispatch])

    if (!state.device || data.dataSets.length === 0) {
        return (<Loading />)
    }

    return (
        <View style={style.container}>
            <View style={{ ...DefaultStyles.elevated, ...style.chart }}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <VitalsLogo style={{ marginHorizontal: 20, padding: 20 }} />
                    <View style={{ flexDirection: 'column' }}>
                        <Headline style={DefaultStyles.header}>Vitals</Headline>
                        <Detail>Today</Detail>
                    </View>
                </View>
                <LineChart style={style.chartBox} chartDescription={{ text: '' }}
                    touchEnabled={true}
                    dragEnabled={true}
                    scaleEnabled={true}
                    pinchZoom={true}
                    extraOffsets={{ bottom: 20 }}
                    legend={{ wordWrapEnabled: true }}
                    xAxis={{
                        position: 'BOTTOM',
                        axisMaximum: timestamp + 500,
                        axisMinimum: timestamp - 10000,
                        valueFormatter: 'date',
                        since: start,
                        valueFormatterPattern: 'HH:mm:ss',
                        timeUnit: 'MILLISECONDS'
                    }}
                    data={data} />
                <View style={style.summary}>
                    <Detail style={{ marginBottom: 20 }}>{summary}</Detail>
                    <TouchableOpacity onPress={() => {
                        drawer.openDrawer();
                    }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -15 }}>
                            <IconButton icon='chevron-right' />
                            <Name>SYNC OPTIONS</Name>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Footer text={footer} />
        </View>)
}

const style = StyleSheet.create({
    container: {
        flex: 6
    },
    chart: {
        flex: 5,
        marginTop: 20,
        backgroundColor: 'white',
        marginHorizontal: 5
    },
    chartBox: {
        flex: 3,
        backgroundColor: '#F3F2F1'
    },
    summary: {
        flex: 1,
        padding: 20
    }

})