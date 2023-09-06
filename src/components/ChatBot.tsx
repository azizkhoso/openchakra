import { ChatIcon, CloseIcon } from '@chakra-ui/icons'
import {
  Box,
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react'
import axios from 'axios'
import React from 'react'
import { useSelector } from 'react-redux'
import { getComponents } from '~core/selectors/components'
import useDispatch from '~hooks/useDispatch'
import { TemplateType } from '~templates'

const demos = ['ph', 'onboarding']

export default function ChatBot() {
  const dispatch = useDispatch()
  const { isOpen, onOpen, onClose } = useDisclosure()
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

  const deleteComponent = (componentId: string) => {
    return Promise.resolve(dispatch.components.deleteComponent(componentId))
  }

  const moveComponent = (componentId: string, parentId: string) => {
    return Promise.resolve(
      dispatch.components.moveComponent({ componentId, parentId }),
    )
  }

  const changeIndex = (componentId: string, targetIndex: number) => {
    return Promise.resolve(
      dispatch.components.changeIndex({ componentId, targetIndex }),
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
              arr[i].args.type,
              arr[i].args.componentId,
              arr[i].args.parentComponentId || 'root',
            )
          } else if (arr[i].functionName === 'updateProps') {
            await updateProps(
              arr[i].args.componentId,
              arr[i].args.prop,
              arr[i].args.value,
            )
          } else if (arr[i].functionName === 'deleteComponent') {
            await deleteComponent(arr[i].args.componentId)
          } else if (arr[i].functionName === 'moveComponent') {
            await moveComponent(arr[i].args.componentId, arr[i].args.parentId)
          } else if (arr[i].functionName === 'changeIndex') {
            await changeIndex(arr[i].args.componentId, arr[i].args.targetIndex)
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => {
        setLoading(false)
        setPrompt('')
      })
  }

  return (
    <React.Fragment>
      <IconButton
        aria-label="chat bot button"
        pos="absolute"
        bottom="4"
        right="4"
        rounded="full"
        colorScheme="green"
        icon={isOpen ? <CloseIcon /> : <ChatIcon />}
        onClick={() => (isOpen ? onClose() : onOpen())}
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent p={0} display="flex" flexDir="column" mt="auto">
          <ModalBody p={0} display="flex" flexDir="column">
            <Box
              display={isOpen ? 'flex' : 'none'}
              flexDir="column"
              gap={2}
              bgColor="white"
              w="full"
              p="2"
              border="2px solid green"
              rounded="lg"
            >
              <Box>Enter your prompt here</Box>
              <Textarea
                rows={2}
                border="1px solid gray"
                isDisabled={isLoading}
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
              />
              <Button
                type="submit"
                disabled={isLoading}
                onClick={() => getCode()}
              >
                {isLoading ? 'Loading' : 'Apply'}
              </Button>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </React.Fragment>
  )
}
