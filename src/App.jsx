import { useState, useEffect } from 'react';
import {
  ChakraProvider,
  useMediaQuery,
  VStack,
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
  Spinner,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { connectWallet } from '../utils/connercWallet'

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [myOwn, setMyOwn] = useState(false)
  const [anotherAddress, setAnotherAddress] = useState(false)
  const [status, setStatus] = useState("")
  const [wallet, setWallet] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [isMobile] = useMediaQuery('(min-width: 800px)')

  useEffect(()=>{
    if (wallet && wallet.length > 0) {
      getTokenBalance(wallet)
    }
  },[wallet])

  const connectWalletPressed = async () => {
    const walletResponse = await connectWallet();
    setStatus(walletResponse.status);
    setWallet(walletResponse.address);
  };

  async function getTokenBalance(address) {
    setIsLoading(true)

    const config = {
      apiKey: 'NvSGA9nAcJWLUncBh6050X2uvMBX1jea',
      network: Network.ETH_GOERLI,
    };

    const alchemy = new Alchemy(config);
    const data = await alchemy.core.getTokenBalances(address);

    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.tokenBalances.length; i++) {
      const tokenData = alchemy.core.getTokenMetadata(
        data.tokenBalances[i].contractAddress
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setHasQueried(true);
    setIsLoading(false)
  }
  return (
    <ChakraProvider>
      <VStack 
        w="100vw"
        minH="100vh"
        h="100%"
        justify="center"
        alignItems="center"
        py={3}
        px={2}
      >
        <Center>
          <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
            <Heading mb={0} fontSize={36} textAlign="center">
              ERC-20 Token Indexer
            </Heading>
            <Text textAlign="center" >
              Plug in an address and this website will return all of its ERC-20
              token balances!
            </Text>
          </Flex>
        </Center>
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent={'center'}
          mt="-10px"
        >
          <Heading 
            mt={42}
            textAlign="center"
            pb={6}
          >
            Would you like to check your own tokens or tokens from another wallet?        
          </Heading>
          <HStack w="100%" justify="center">
            <Button
              onClick={()=>{
                connectWalletPressed()
                setMyOwn(true)
                setAnotherAddress(false)
                setResults([])
              }}
              colorScheme='teal' 
            >
              My Own
            </Button>
            <Button
              onClick={()=>{
                setMyOwn(false)
                setAnotherAddress(true)
                setWallet("")
                setResults([])
              }}
              colorScheme='teal'  
            >
              Another
            </Button>
          </HStack>
          {
            myOwn ?
            <VStack pt={3}>
              <Text as='b'>{status}</Text>
              {
                wallet && wallet.length > 0 &&
                <Text>Address: {wallet}</Text>
              }
            </VStack> :
            anotherAddress ?
            <>
              <Heading mt={3} mx={2} textAlign="center" mb={2}>
                Get all the ERC-20 token balances of this address:
              </Heading>
              <Input
                onChange={(e) => setUserAddress(e.target.value)}
                color="black"
                maxW="600px"
                w="90%"
                textAlign="center"
                p={4}
                bgColor="white"
                fontSize={24}
                mx={2}
              />
              <Button 
                fontSize={20} 
                onClick={()=>{
                  getTokenBalance(userAddress)
                  setIsLoading(true)
                }} 
                mt={2} 
                colorScheme='teal'  
              >
                Check ERC-20 Token Balances
              </Button>
            </> :
            <></>
          }


          {hasQueried ? (
            <>
              {
                results && 
                results.tokenBalances && 
                results.tokenBalances.length > 0 && 
                <>
                  <Heading my={3} textAlign="center">ERC-20 token balances:</Heading>
                  <SimpleGrid w={'90vw'} columns={!isMobile ? 1 : 4} spacing={!isMobile ? 3 : 24}>
                    { results.tokenBalances.map((e, i) => {
                      return (
                        <Flex
                          flexDir={'column'}
                          color="white"
                          bg="teal"
                          w={!isMobile ? '90vw' : '20vw'}
                          key={e.id}
                        >
                          <Box>
                            <b>Symbol:</b> ${tokenDataObjects[i]?.symbol}&nbsp;
                          </Box>
                          <Box>
                            <Text noOfLines={1} overflow="hidden">
                              <b>Balance:</b>&nbsp;
                              {Utils.formatUnits(
                                e.tokenBalance,
                                tokenDataObjects[i]?.decimals
                              )}
                            </Text>
                          </Box>
                          <Image src={tokenDataObjects[i]?.logo} />
                        </Flex>
                      );
                    })}
                  </SimpleGrid>
                </>
              }
            </>
          ) : 
          isLoading ?
          <Spinner colorScheme='teal' size="xl" py={3} my={3}/> :
          (
            <Text mt={3} textAlign="center">
              Please make a query! This may take a few seconds...
            </Text>
          )}
        </Flex>
      </VStack>
    </ChakraProvider>
  );
}

export default App;
