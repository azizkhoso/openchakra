import { Box, Button, Input, Text } from '@chakra-ui/react'
import React from 'react'
import { useSelector } from 'react-redux'
import { getComponents } from '~core/selectors/components'
import useDispatch from '~hooks/useDispatch'
import { TemplateType } from '~templates'

const demos = ['ph', 'onboarding']

export default function ChatBot() {
  const dispatch = useDispatch()
  const components = useSelector(getComponents)
  const [isLoading, setLoading] = React.useState(false)
  const [prompt, setPrompt] = React.useState('')
  function loadDemo() {
    const index =
      Number.parseInt((Math.random() * 100).toFixed(0)) % demos.length
    const demo = demos[index]
    console.log(demo, index)
    dispatch.components.loadDemo(demo as TemplateType)
  }
  function getCode() {
    setLoading(true)
    fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        // state: components,
      }),
    })
      .then(res => {
        console.log(res.body)
        return res.json()
      })
      .then(data => dispatch.components.setState(JSON.parse(data.content)))
      .catch(err => console.error(err))
      .finally(() => {
        setLoading(false)
        setPrompt('')
      })
  }

  return (
    <Box
      display="flex"
      flexDir="column"
      position="absolute"
      bottom="4"
      right="4"
      bgColor="white"
      maxW="400px"
      w="full"
      p="2"
      border="2px solid green"
      rounded="lg"
    >
      <Text>Enter your prompt here</Text>
      <Input
        type="text"
        multiple
        border="1px solid gray"
        isDisabled={isLoading}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />
      <Button disabled={isLoading} onClick={() => getCode()}>
        {isLoading ? 'Loading' : 'Load'}
      </Button>
    </Box>
  )
}
