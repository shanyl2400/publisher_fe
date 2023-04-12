import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ChakraProvider,
  FormControl,
  FormLabel,
  Button,
  Select,
  Flex,
  Box,
  Input,
  Stack,
  Heading,
  Text,
  Checkbox,
  useToast,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import {
  listBranches,
  listZrtcs,
  listPublishRecords,
  getPublishLogs,
  publish,
} from "./api/api";

function App() {
  const toast = useToast();
  const [gomssBranches, setGomssBranches] = useState(["v4.0.0"]);
  const [selectedBranch, setSelectedBranch] = useState("v4.0.0")

  const [zrtcVersion, setZrtcVersion] = useState([{ name: "zrtc", path: "zrtc" }]);
  const [selectedZrtc, setSelectedZrtc] = useState("zrtc")

  const [outerZRTC, setOuterZRTC] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)

  const [version, setVersion] = useState("");

  const [logs, setLogs] = useState([])
  const [publishRecords, setPublishRecords] = useState([])

  const toastError = (title, err) => {
    let errMsg = "未知错误,请联系系统管理员"
    if (err.data != undefined && err.data.message != undefined) {
      errMsg = err.data.message
    }
    toast({
      title: title,
      description: errMsg,
      status: 'error',
      duration: 6000,
      isClosable: true,
    })
  }

  const fetchBranchesAndZRTC = useCallback(() => {
    listBranches().then((data) => {
      setGomssBranches(data.branches);
      let branch = data.branches[data.branches.length - 1];
      updateSelectedBranch(branch);
      fetchZrtcs(branch);
    }).catch((err) => {
      toastError('获取branch失败', err);
    });
  }, []);

  const fetchZrtcs = (branch)=>{
    listZrtcs().then((data) => {
      setZrtcVersion(data.zrtcs);
      // updateSelectedZrtc(data.zrtcs[data.zrtcs.length - 1].path);
      let zrtc = data.zrtcs[data.zrtcs.length - 1].path;
      setSelectedZrtc(zrtc);
      setVersion(branch + "." + parseZRTCVersion(zrtc));
    }).catch((err) => {
      toastError('获取zrtc失败', err);
    });
  };

  const updateSelectedZrtc = (zrtc) => {
    setSelectedZrtc(zrtc);
    setVersion(selectedBranch + "." + parseZRTCVersion(zrtc));
  }

  const updateSelectedBranch = (branch) => {
    setSelectedBranch(branch);
    setVersion(branch + "." + parseZRTCVersion(selectedZrtc));
  }

  const updateZRTCVersion = ()=>{
    setVersion(selectedBranch + "." + parseZRTCVersion(selectedZrtc));
  }

  const updateOuterZRTC = (checked) => {
    setOuterZRTC(checked);
    if (checked) {
      setVersion(selectedBranch + ".zrtc-outer");
    }else{
      setVersion(selectedBranch + "." + parseZRTCVersion(selectedZrtc));
    }
  }

  const parseZRTCVersion = (zrtc) => {
    return zrtc.split(".tar.gz")[0];
  }

  const fetchRecords = useCallback(() => {
    listPublishRecords((data)=>{
      setPublishRecords(data.records)
    }, err => {
      toastError('发布记录失败', err);
    })
  }, []);

  const fetchPublishLogs = () => {
    getPublishLogs((data) => {
      console.log("publish logs:", data.logs);
      setLogs(data.logs);
    })
  }

  const onPublish = () => {
    if (version == "" || selectedBranch == "") {
      toast({
        title: '参数错误',
        description: "version或branch不能为空!",
        status: 'warning',
        duration: 6000,
        isClosable: true,
      })
      return;
    }

    setPublishLoading(true);
    let data = {
      gomss_branch: selectedBranch,
      zrtc_path: selectedZrtc,
      local_zrtc: outerZRTC,
      version: version,
    }
    let intervalID;
    publish(data, () => {
      toast({
        title: '发布成功',
        description: "版本" + version + "发布成功!",
        status: 'success',
        duration: 6000,
        isClosable: true,
      })
      setPublishLoading(false);
      clearInterval(intervalID);
      fetchPublishLogs();

      fetchRecords();
    }, (err) => {
      toastError('发布失败', err);
      setPublishLoading(false);
      clearInterval(intervalID);
      fetchPublishLogs();
    });

    intervalID = setInterval(() => {
      fetchPublishLogs();
    }, 1000);
  }

  const dateFormat = (timestamp) => {
    let date = new Date(timestamp);
    return date.getFullYear()+
    "年"+(date.getMonth()+1)+
    "月"+date.getDate()+
    "日 "+date.getHours()+
    ":"+date.getMinutes()+
    ":"+date.getSeconds()
  }

  useEffect(() => {
    // fetchZrtcs();
    fetchBranchesAndZRTC();
    fetchRecords();

  }, [fetchBranchesAndZRTC, fetchRecords]);
  return (
    <ChakraProvider className="App">
      <Box padding='8' color='black' maxW='md'>
        <Heading>GOMSS发版工具 v0.1</Heading>
      </Box>
      <Flex >
        <Box padding='6' w='600px'>

          <Box>
            <FormControl>
              <FormLabel>GOMSS版本</FormLabel>
              <Select value={selectedBranch} onChange={(event) => { updateSelectedBranch(event.target.value) }}>
                {gomssBranches.map((item) => {
                  return <option value={item}>{item}</option>
                })}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>zrtc版本</FormLabel>
              <Stack spacing={5} direction='row'>
                <Select
                  disabled={outerZRTC}
                  value={selectedZrtc}
                  onChange={(event) => { updateSelectedZrtc(event.target.value) }}>
                  {zrtcVersion.map((item) => {
                    return <option value={item.path}>{item.name}</option>
                  })}
                </Select>
                <Box w='180px' paddingTop='6px'>
                  <Checkbox isChecked={outerZRTC} onChange={event => { updateOuterZRTC(event.target.checked) }}>外部zrtc</Checkbox>
                </Box>
              </Stack>

            </FormControl>

            <FormControl>
              <FormLabel>版本号</FormLabel>
              <Input value={version} isReadOnly={true} onChange={event => { setVersion(event.target.value) }} />
            </FormControl>

            <Button
              mt={4}
              colorScheme='teal'
              type='submit'
              onClick={() => onPublish()}
              isLoading={publishLoading}
            >
              发布
            </Button>
          </Box>
        </Box>

        <Box 
        flex='1' 
        maxH='400'
         minH='400' 
         padding='4' 
         overflowY={"scroll"} 
         margin='6' 
         borderWidth='1px' 
         borderRadius='lg'>
          <Text>---运行日志---</Text>
          {logs.map((item) => {
            return <Text style={{ whiteSpace: "pre-wrap" }}>{item}</Text>
          })}

        </Box>
      </Flex>

      <TableContainer padding='10'>
        <Table size='sm'>
          <Thead>
            <Tr>
              <Th>发布时间</Th>
              <Th>版本号</Th>
              <Th>gomss版本</Th>
              <Th>zrtc版本</Th>
            </Tr>
          </Thead>
          <Tbody>
            {publishRecords.map(item=>{
              return  <Tr>
                        <Td>{dateFormat(item.recorded_at)}</Td>
                        <Td>{item.version}</Td>
                        <Td>{item.gomss_branch}</Td>
                        <Td>{item.zrtc_version}</Td>
                      </Tr>
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </ChakraProvider>
  );
}

export default App;
