import { Box, Button, Input, Text } from '@chakra-ui/react'
import axios from 'axios'
import React from 'react'
import { useSelector } from 'react-redux'
import { getComponents } from '~core/selectors/components'
import useDispatch from '~hooks/useDispatch'
import { TemplateType } from '~templates'

const demos = ['ph', 'onboarding']

function createComponentTree(
  componentTreeDict: any,
  finalDict: any = {},
  parent = 'root',
) {
  let childrenIds = []

  if (
    componentTreeDict.children === null ||
    componentTreeDict.children === undefined
  ) {
    componentTreeDict.children = []
  } else if (Array.isArray(componentTreeDict.children)) {
    for (let ch of componentTreeDict.children) {
      if (typeof ch !== 'string') {
        if (ch.type === 'Text') {
          if (typeof ch.props !== 'object') {
            ch.props = {}
          }
          ch.props.children = ch.children[0] || 'Lorem ipsum'
        }
        createComponentTree(ch, finalDict, componentTreeDict.id)
        childrenIds.push(ch.id)
      }
    }
  }

  if (
    componentTreeDict.props === null ||
    componentTreeDict.props === undefined
  ) {
    componentTreeDict.props = {}
  }

  componentTreeDict.children = childrenIds
  if (!componentTreeDict.id)
    componentTreeDict.id = 'comp-' + Date.now().toString()
  finalDict[componentTreeDict.id] = componentTreeDict
  finalDict[componentTreeDict.id].parent = parent

  return finalDict
}

export default function ChatBot() {
  const dispatch = useDispatch()
  const components = useSelector(getComponents)
  const [isLoading, setLoading] = React.useState(false)
  const [prompt, setPrompt] = React.useState('')

  const addComponent = (type: string, componentId: string, parent: string) => {
    return Promise.resolve(
      dispatch.components.addComponent({
        parentName: parent,
        type: type as ComponentType,
        testId: componentId,
      }),
    )
  }

  const updateProps = (componentId: string, prop: string, value: string) => {
    return Promise.resolve(
      dispatch.components.updateProps({
        id: componentId,
        name: prop,
        value: value,
      }),
    )
  }

  function loadDemo() {
    const index =
      Number.parseInt((Math.random() * 100).toFixed(0)) % demos.length
    const demo = demos[index]
    console.log(demo, index)
    dispatch.components.loadDemo(demo as TemplateType)
  }

  function getCode() {
    setLoading(true)
    axios
      .post('http://localhost:5000/predict', {
        message: prompt,
        state: components,
      })
      // .then(res => dispatch.components.setState(res.data))
      .then(res => JSON.parse(res.data.function_call.arguments).functionsArray)
      .then(async arr => {
        for (let i = 0; i < arr.length; i += 1) {
          console.log(arr[i])
          if (arr[i].functionName === 'addComponent') {
            await addComponent(
              arr[i].type,
              arr[i].componentId,
              arr[i].parentComponentId || 'root',
            )
          } else if (arr[i].functionName === 'updateProps') {
            await updateProps(arr[i].componentId, arr[i].prop, arr[i].value)
          }
        }
      })
      /* .then(d => {
        const rootChildren: string[] = []
        Object.keys(d).forEach(k => {
          if (d[k].parent === 'root') rootChildren.push(k)
        })
        const st = {
          root: {
            id: 'root',
            parent: 'root',
            type: 'Box',
            children: rootChildren,
            props: {},
          },
          ...d,
        }
        console.log({ st })
        if (d.root) dispatch.components.setState(st)
        else dispatch.components.setState(st)
      }) */
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
      <Text as="p">Enter your prompt here</Text>
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
