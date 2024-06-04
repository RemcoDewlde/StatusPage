import {ReactNode, useEffect, useState} from 'react';
import { Box, Flex, Link, HStack, IconButton, useDisclosure, VStack } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { invoke } from '@tauri-apps/api/tauri'
import {Command} from "../../utils/command.enum.ts";

const Links = ['Home', 'About', 'Contact'];

const NavLink = ({ children }: { children: ReactNode }) => (
    <Link
        px={2}
        py={1}
        rounded={'md'}
        _hover={{
            textDecoration: 'none',
            bg: 'gray.200',
        }}
        href={'#'}>
        {children}
    </Link>
);

const Navbar = () => {
    const [name, setName] = useState('');
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        const fetchName = async () => {
            try {
                let appName: string = await invoke(Command.GetApplicationName);
                setName(appName.toString() ?? 'dev');
            } catch (error) {
                console.error("Error fetching name:", error);
                setName('dev');
            }
        };

        fetchName();
    }, []);

    return (
        <Box bg="gray.100" px={4}>
            <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
                <IconButton
                    size={'md'}
                    icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                    aria-label={'Open Menu'}
                    display={{ md: 'none' }}
                    onClick={isOpen ? onClose : onOpen}
                />
                <HStack spacing={8} alignItems={'center'}>
                    <Box>{name}</Box>
                    <HStack
                        as={'nav'}
                        spacing={4}
                        display={{ base: 'none', md: 'flex' }}>
                        {Links.map((link) => (
                            <NavLink key={link}>{link}</NavLink>
                        ))}
                    </HStack>
                </HStack>
            </Flex>

            {isOpen ? (
                <Box pb={4} display={{ md: 'none' }}>
                    <VStack as={'nav'} spacing={4}>
                        {Links.map((link) => (
                            <NavLink key={link}>{link}</NavLink>
                        ))}
                    </VStack>
                </Box>
            ) : null}
        </Box>
    );
};


export default Navbar;
