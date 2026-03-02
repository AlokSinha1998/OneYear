import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import YearProgressScreen from './src/screen/YearProgressScreen'
import { SafeAreaView } from 'react-native-safe-area-context'
import YearProgressScreenMulColor from './src/screen/YearProgressScreenMulColor'
import AppNavigation from './src/navigation/stacknavigation/AppNavigation'

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>

      <AppNavigation />
    </SafeAreaView>
  )
}

export default App  