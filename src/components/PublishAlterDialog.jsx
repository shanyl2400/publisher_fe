import {  useRef } from 'react';
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    AlertDialogCloseButton,
    Button,
    Text,
  } from '@chakra-ui/react'
export function PublishAlterDialog(props){
    const cancelRef = useRef()
    return <AlertDialog
    motionPreset='scale'
    leastDestructiveRef={cancelRef}
    onClose={props.onClose}
    isOpen={props.visible}
    isCentered
  >
    <AlertDialogOverlay />

    <AlertDialogContent>
      <AlertDialogHeader>是否确认发布？</AlertDialogHeader>
      <AlertDialogCloseButton />
      <AlertDialogBody>
        <Text>
        版本号：<Text as='b'>{props.version}</Text>
        </Text>
        <Text>是否确认发布该版本gomss?</Text>
      </AlertDialogBody>
      <AlertDialogFooter>
        <Button ref={cancelRef} onClick={props.onClose} >
          取消
        </Button>
        <Button colorScheme='blue' ml={3} onClick={props.onOK}>
          发布
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}