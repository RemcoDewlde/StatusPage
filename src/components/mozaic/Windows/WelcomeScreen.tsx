import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function WelcomeView() {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-center">Welcome to StatusPage Collector</CardTitle>
                    <CardDescription className="text-center text-lg">
                        A sleek and customizable status page application built with Tauri, TypeScript, and Tailwind CSS
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="features">Key Features</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="mt-6">
                            <h3 className="text-xl font-semibold mb-2">What is StatusPage?</h3>
                            <p className="text-gray-600">
                                StatusPage is a modern, customizable status page application that allows you to create beautiful and responsive status pages for your services. It provides real-time updates to your users and is built with cutting-edge technologies.
                            </p>
                            <div className="mt-4">
                                <img src="src/assets/welcome.png" alt="StatusPage Screenshot" className="w-full rounded-lg shadow-md" />
                            </div>
                        </TabsContent>
                        <TabsContent value="features" className="mt-6">
                            <h3 className="text-xl font-semibold mb-2">Key Features</h3>
                            <ul className="list-disc list-inside text-gray-600 space-y-2">
                                <li>📊 Automatic status updates</li>
                                <li>🎨 Customizable layout</li>
                                <li>🔧 Easy configuration and setup</li>
                                <li>📱 Fully responsive designs</li>
                                <li>🚀 Built with modern technologies (Tauri, TypeScript, Tailwind CSS)</li>
                                <li>🔒 Secure and scalable</li>
                                <li>🖥️ Cross-platform desktop application (Windows, macOS, Linux)</li>
                            </ul>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

