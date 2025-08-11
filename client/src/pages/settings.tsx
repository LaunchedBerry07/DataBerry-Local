import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database, 
  Download,
  Trash2,
  Save,
  User,
  Palette,
  Moon,
  Sun
} from "lucide-react";

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState({
    profile: {
      name: "John Doe",
      email: "john.doe@company.com",
    },
    theme: {
      darkMode: true,
      accentColor: "#FF6B9D",
    },
    notifications: {
      emailProcessed: true,
      weeklyReport: false,
      monthlyReport: true,
      errorAlerts: true,
    },
    privacy: {
      dataRetention: 365,
      autoDelete: false,
    },
    integration: {
      gmailSync: true,
      driveExport: true,
      autoCategorizationn: true,
    }
  });

  const handleSettingChange = (section: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const settingSections = [
    {
      title: "Profile",
      icon: User,
      description: "View and manage your account information",
      settings: [
        { key: "name", label: "Full Name", type: "text" },
        { key: "email", label: "Email Address", type: "email", readonly: true },
      ]
    },
    {
      title: "Theme",
      icon: Palette,
      description: "Customize your DataBerry appearance",
      settings: [
        { key: "darkMode", label: "Dark Mode", type: "switch" },
        { key: "accentColor", label: "Accent Color", type: "color" },
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      description: "Manage your email and report notifications",
      settings: [
        { key: "emailProcessed", label: "Email Processing Complete", type: "switch" },
        { key: "weeklyReport", label: "Weekly Summary Report", type: "switch" },
        { key: "monthlyReport", label: "Monthly Financial Report", type: "switch" },
        { key: "errorAlerts", label: "Error Alerts", type: "switch" },
      ]
    },
    {
      title: "Privacy",
      icon: Shield,
      description: "Control your data privacy and security settings",
      settings: [
        { key: "dataRetention", label: "Data Retention (days)", type: "number" },
        { key: "autoDelete", label: "Auto-delete processed emails", type: "switch" },
      ]
    },
    {
      title: "Integration",
      icon: Database,
      description: "Configure external service integrations",
      settings: [
        { key: "gmailSync", label: "Gmail Synchronization", type: "switch" },
        { key: "driveExport", label: "Google Drive Export", type: "switch" },
        { key: "autoCategorizationn", label: "Auto-categorization", type: "switch" },
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-primary-800">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
        
        <main className="flex-1 overflow-auto p-6 bg-primary-900/50">
          {/* Page Header */}
          <div className="gradient-card rounded-2xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-purple-300">Customize your DataBerry experience</p>
              </div>
              
              <Button className="gradient-cyan-blue text-white action-btn">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {settingSections.map((section) => (
              <div key={section.title} className="gradient-card rounded-2xl p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 gradient-pink-magenta rounded-xl flex items-center justify-center">
                    <section.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                    <p className="text-purple-300 text-sm">{section.description}</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {section.settings.map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between p-4 rounded-xl bg-primary-600/20 border border-primary-500/20">
                      <Label className="text-white font-medium cursor-pointer">
                        {setting.label}
                      </Label>
                      
                      {setting.type === "switch" && (
                        <Switch
                          checked={settings[section.title.toLowerCase() as keyof typeof settings]?.[setting.key]}
                          onCheckedChange={(value) => 
                            handleSettingChange(
                              section.title.toLowerCase() as keyof typeof settings, 
                              setting.key, 
                              value
                            )
                          }
                        />
                      )}
                      
                      {(setting.type === "text" || setting.type === "email") && (
                        <Input
                          type={setting.type}
                          value={settings[section.title.toLowerCase() as keyof typeof settings]?.[setting.key] || ""}
                          onChange={(e) => 
                            handleSettingChange(
                              section.title.toLowerCase() as keyof typeof settings,
                              setting.key,
                              e.target.value
                            )
                          }
                          readOnly={setting.readonly}
                          className="w-64 bg-primary-600/50 border-primary-500/50 text-white"
                        />
                      )}
                      
                      {setting.type === "color" && (
                        <div className="flex items-center space-x-3">
                          <input
                            type="color"
                            value={settings[section.title.toLowerCase() as keyof typeof settings]?.[setting.key] || "#FF6B9D"}
                            onChange={(e) => 
                              handleSettingChange(
                                section.title.toLowerCase() as keyof typeof settings,
                                setting.key,
                                e.target.value
                              )
                            }
                            className="w-12 h-10 rounded-lg border border-primary-500/50 bg-transparent cursor-pointer"
                          />
                          <Input
                            type="text"
                            value={settings[section.title.toLowerCase() as keyof typeof settings]?.[setting.key] || "#FF6B9D"}
                            onChange={(e) => 
                              handleSettingChange(
                                section.title.toLowerCase() as keyof typeof settings,
                                setting.key,
                                e.target.value
                              )
                            }
                            className="w-24 bg-primary-600/50 border-primary-500/50 text-white font-mono"
                          />
                        </div>
                      )}
                      
                      {setting.type === "number" && (
                        <Input
                          type="number"
                          value={settings[section.title.toLowerCase() as keyof typeof settings]?.[setting.key] || 0}
                          onChange={(e) => 
                            handleSettingChange(
                              section.title.toLowerCase() as keyof typeof settings,
                              setting.key,
                              parseInt(e.target.value)
                            )
                          }
                          className="w-24 bg-primary-600/50 border-primary-500/50 text-white text-center"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Account Management Section */}
            <div className="gradient-card rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 gradient-red rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Account Management</h2>
                  <p className="text-purple-300 text-sm">Manage your account and data</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Button 
                  variant="outline" 
                  className="justify-start border-primary-500/50 text-purple-300 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>
                
                <Button 
                  variant="outline" 
                  className="justify-start border-red-500/50 text-red-400 hover:text-red-300 hover:border-red-400"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>

              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-300 text-sm">
                  <strong>Warning:</strong> Account deletion is permanent and cannot be undone. All your data will be permanently removed.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}