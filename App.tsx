import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import YearProgressScreen from './src/screen/YearProgressScreen'
import { SafeAreaView } from 'react-native-safe-area-context'
import YearProgressScreenMulColor from './src/screen/YearProgressScreenMulColor'

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>

      <YearProgressScreenMulColor />
    </SafeAreaView>
  )
}

export default App  