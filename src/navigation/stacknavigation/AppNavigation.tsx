import * as React from 'react';
import { View, Text } from 'react-native';
import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import YearProgressScreenMulColor from '../../screen/YearProgressScreenMulColor';

const RootStack = createNativeStackNavigator({
    screenOptions: {
        headerShown: false
    },
    screens: {
        YearProgressScreenMulColor: YearProgressScreenMulColor,
    },
});

const Navigation = createStaticNavigation(RootStack);

export default function AppNavigation() {
    return <Navigation />;
}