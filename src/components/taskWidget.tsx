import { View, Text } from 'react-native'
import { useState } from "react";

export interface TaskWidgetProps {
  title: string;
  time: string;
  place: string;
}

const TaskWidget = ({ title, time, place }: TaskWidgetProps) => {
  const [nextTask, setNextTask] = useState(false)

  if (nextTask) {
    return (
      <View className='justify-center bg-[#00d800] p-4 rounded-2xl'>
        <View className='flex flex-row justify-between'>
          <Text className='text-2xl color-white font-bold'>
            <Text className='color-black font-extrabold'>{'> '}</Text>
            {title}
          </Text>
          <Text className='color-white'>{time}</Text>
        </View>
        <View>
          <Text className='color-white font-light opacity-85'>{place}</Text>
        </View>
      </View>
    )
  } else {
    return (
      <View className='justify-center bg-[#202020] p-4 rounded-2xl border-dashed border-2 border-[#ababab75]'>
        <View className='flex flex-row justify-center py-16'>
          <Text className='text-sm color-white font-light opacity-40'>No Tasks remaining for today</Text>
        </View>
      </View>
    )
  }
}

export default TaskWidget
