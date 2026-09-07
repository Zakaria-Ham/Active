import { View, Text } from 'react-native'

export interface taskWidgetProps {
  title: string;
  time:string;
  place:string;
}

const taskWidget = ({title,time,place}: taskWidgetProps) => {
  return (
    <View className='flex-1 justify-center'>
      <View className='flex flex-row justify-between'>
        <Text className='text-2xl color-white font-bold'><Text className='color-[#00ff00]'>{'>'}</Text>{title}</Text>
        <Text>{time}</Text>
      </View>
      <View><Text>{place}</Text></View>
    </View>
  )
}

export default taskWidget