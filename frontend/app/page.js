'use client';

import axios from 'axios';
import { AlertCircle, PackageOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar22 } from '@/components/ui/date_picker';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemFooter,
    ItemHeader,
    ItemMedia,
    ItemTitle,
} from '@/components/ui/item';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';

import GoogleLoginButton from '../components/GoogleLoginButton';

export default function Home() {
    const [connectionStatus, setConnectionStatus] = useState('loading');

    const getStatusClasses = () => {
        if (connectionStatus === 'connected')
            return 'bg-green-100 text-green-700';
        if (connectionStatus === 'disconnected')
            return 'bg-red-100 text-red-700';
        return 'bg-yellow-100 text-yellow-700';
    };

    useEffect(() => {
        const checkConnection = async () => {
            try {
                const baseUrl =
                    process.env.NEXT_PUBLIC_API_URL ||
                    'http://localhost:8000/api';
                const response = await axios.get(`${baseUrl}/health/`);
                if (response.data.database_connected) {
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('disconnected');
                }
            } catch (error) {
                setConnectionStatus('disconnected');
            }
        };

        checkConnection();
        const interval = setInterval(checkConnection, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-3xl font-bold mb-6">Bible Study App</h1>
                <div className={`mb-6 p-3 rounded ${getStatusClasses()}`}>
                    {connectionStatus === 'loading' && 'Checking connection...'}
                    {connectionStatus === 'connected' &&
                        '✓ Connected to database'}
                    {connectionStatus === 'disconnected' &&
                        '✗ Connection failed'}
                </div>
                <div className="space-y-4">
                    <a
                        href="/login"
                        className="block w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                    >
                        Sign In
                    </a>
                    <a
                        href="/register"
                        className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition"
                    >
                        Create Account
                    </a>
                    <a
                        href="/dashboard"
                        className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition"
                    >
                        Dashboard
                    </a>
                    <GoogleLoginButton />
                </div>
                <div className="mt-8">
                    <Button className="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
                        Tailwind v3 is working!!!
                    </Button>
                </div>
                <Card className="bg-bible-gold h-20 flex items-center p-3 m-3 mt-4">
                    <p className="text-red-700">
                        This is a shadcn/ui Card component
                    </p>
                </Card>
                <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                        <AccordionTrigger>
                            Is this an accordian?
                        </AccordionTrigger>
                        <AccordionContent>
                            Yes. This is an aaaaacooordian.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <AlertDialog>
                    <AlertDialogTrigger>Open Alert-Dialog</AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will
                                permanently delete your account and remove your
                                data from our servers.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <Alert variant="destructive">
                    <AlertCircle />
                    <AlertTitle>
                        ALERT: Unable to process your payment.
                    </AlertTitle>
                    <AlertDescription>
                        <p>
                            Please verify your billing information and try
                            again.
                        </p>
                        <ul className="list-inside list-disc text-sm">
                            <li>Check your card details</li>
                            <li>Ensure sufficient funds</li>
                            <li>Verify billing address</li>
                        </ul>
                    </AlertDescription>
                </Alert>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                Avatar Image for user account
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                This is a checkbox below
                <Checkbox />
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <Calendar22 />
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <PackageOpen />
                        </EmptyMedia>
                        <EmptyTitle>No data</EmptyTitle>
                        <EmptyDescription>No data found</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button>Add data</Button>
                    </EmptyContent>
                </Empty>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <FieldSet>
                    <FieldLegend>Fill out this survey!</FieldLegend>
                    <FieldDescription>
                        This appears on invoices and emails.
                    </FieldDescription>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="name">Full name</FieldLabel>
                            <Input
                                id="name"
                                autoComplete="off"
                                placeholder="Evil Rabbit"
                            />
                            <FieldDescription>
                                This appears on invoices and emails.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input
                                id="username"
                                autoComplete="off"
                                aria-invalid
                            />
                            <FieldError>Choose another username.</FieldError>
                        </Field>
                        <Field orientation="horizontal">
                            <Switch id="newsletter" />
                            <FieldLabel htmlFor="newsletter">
                                Subscribe to the newsletter
                            </FieldLabel>
                        </Field>
                    </FieldGroup>
                </FieldSet>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                One Time Password(OTP) Input
                <InputOTP maxLength={6}>
                    <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                    </InputOTPGroup>
                </InputOTP>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <Item>
                    <ItemHeader>*This displays items*</ItemHeader>
                    <ItemMedia />
                    <ItemContent>
                        <ItemTitle>Hoka Arahi 5</ItemTitle>
                        <ItemDescription>
                            With every iteration, the Arahi rewrites history as
                            a different class of support shoe.{' '}
                        </ItemDescription>
                    </ItemContent>
                    <ItemActions />
                    <ItemFooter>
                        Disclaimer: This footwear is not for eating
                    </ItemFooter>
                </Item>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <div className="mt-5 mb-5">
                    <h2>Navigation Bar</h2>
                </div>
                <NavigationMenu>
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Home</NavigationMenuTrigger>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                Saved Verses
                            </NavigationMenuTrigger>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>
                                Account
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <div>Hello</div>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <div className="mt-5 mb-5">
                    <h2>Pagination</h2>
                </div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <div className="mt-5 mb-5">
                    <h2>Skeleton</h2>
                    <p>For loading screens</p>
                </div>
                <Skeleton className="h-[20px] w-[100px] rounded-full" />
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <div className="mt-5 mb-5">
                    <h2>Tabs</h2>
                    <p>For Account/Password/Billing/etc</p>
                </div>
                <Tabs defaultValue="account" className="w-[400px]">
                    <TabsList>
                        <TabsTrigger value="account">Account</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="account">
                        Make changes to your account here.
                    </TabsContent>
                    <TabsContent value="password">
                        Change your password here.
                    </TabsContent>
                </Tabs>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <div className="mt-5 mb-5">
                    <h2>Text Area</h2>
                    <p>It&apos;s just a text area, chillout.</p>
                </div>
                <Textarea />
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
                <div className="mt-5 mb-5">
                    <h2>Toggle Button!</h2>
                    <p>In case user wants to save a verse or bookmark.</p>
                    <p>It&apos;s subtle but it highlights it. Look closer!</p>
                </div>
                <Toggle>Toggle</Toggle>
                <div className="mt-10 mb-10">
                    ------------------------ ------------------------
                </div>
            </div>
        </div>
    );
}
