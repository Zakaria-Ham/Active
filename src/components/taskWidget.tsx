import { View, Text } from 'react-native'

export interface taskWidgetProps {
  title: string;
  time:string;
  place:string;
}

const taskWidget = ({title,time,place}: taskWidgetProps) => {
  return (
    <View className='justify-center bg-[#00d800] p-4 rounded-2xl'>
      <View className='flex flex-row justify-between'>
        <Text className='text-2xl color-white font-bold'><Text className='color-black font-extrabold'>{'> '}</Text>{title}</Text>
        <Text className='color-white'>{time}</Text>
      </View>
      <View><Text className='color-white font-light opacity-85'>{place}</Text></View>
    </View>
  )
}

export default taskWidget