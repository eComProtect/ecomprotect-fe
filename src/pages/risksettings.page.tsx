import { useState, useEffect } from "react";
import { Box } from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCreateSettings } from "@/hooks/settings/usecreatesettings";
import { Flex } from "@/components/ui/flex";
import { useIdentity } from "@/hooks/useidentity";
import { cn } from "@/lib/utils";
import { useFetchSettings } from "@/hooks/settings/usefetchsettings";
import { wordsToNumber } from "@/lib/wordtonumber";
import { AdditionalConfiguration } from "@/components/reports/additionalconfiguration";

type SettingsState = {
  lostParcelThreshold: number;
  lostParcelPeriod: string;
  lossRateThreshold: number;
  matchSensitivity: string;
  primaryAction: string;
  requireEsignature: boolean;
  forceSignedDelivery: boolean;
  requirePhoto: boolean;
  sendCancellationEmail: boolean;
  includeWavierLink: boolean;

  emailNotificationsEnabled: boolean;
  notificationEmail: string;
  includeOrderDetails: boolean;
  includeReasonForFlag: boolean;
  includeRecommendedAction: boolean;
  autoHoldRiskyOrders: boolean;
};

function RiskSettings() {
  const [settings, setSettings] = useState<SettingsState>({
    lostParcelThreshold: 3,
    lostParcelPeriod: "6",
    lossRateThreshold: 40,
    matchSensitivity: "medium",
    primaryAction: "hold",
    requireEsignature: false,
    forceSignedDelivery: false,
    requirePhoto: false,
    sendCancellationEmail: false,
    includeWavierLink: false,

    emailNotificationsEnabled: true,
    notificationEmail: "info@example.com",
    includeOrderDetails: true,
    includeReasonForFlag: true,
    includeRecommendedAction: true,
    autoHoldRiskyOrders: false,
  });

  const { mutate: saveSettings, isPending: isSaving } = useCreateSettings();
  const { data: fetchedData, isLoading } = useFetchSettings();
  const [thresholdInput, setThresholdInput] = useState<string>(
    settings.lostParcelThreshold.toString()
  );

  const [lossRateInput, setLossRateInput] = useState<string>(
    settings.lossRateThreshold.toString()
  );
  const [lossRateError, setLossRateError] = useState<string>("");

  const handleChange = (key: keyof SettingsState, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const { user } = useIdentity();
  const userPackage = user?.package;

  useEffect(() => {
    if (fetchedData) {
      const f = fetchedData;
      setThresholdInput((f.lostParcelThreshold ?? 3).toString());
      setLossRateInput((f.lossRateThreshold ?? 40).toString());
      setSettings((prev) => ({
        ...prev,
        lostParcelThreshold: f.lostParcelThreshold ?? 3,
        lostParcelPeriod: f.lostParcelPeriod?.toString() ?? "6",
        lossRateThreshold: f.lossRateThreshold ?? 40,
        matchSensitivity: f.matchSensitivity ?? "medium",
        primaryAction: f.primaryAction ?? "hold",
        requireEsignature: f.requireESignature ?? false,
        forceSignedDelivery: f.forceCourierSignedDelivery ?? false,
        requirePhoto: f.photoOnDelivery ?? false,
        sendCancellationEmail: f.sendCancellationEmail ?? false,
        includeWavierLink: f.includeWavierLink ?? false,
        autoHoldRiskyOrders: f.autoHoldRiskyOrders ?? false,

        emailNotificationsEnabled: f.emailNotificationsEnabled ?? true,
        notificationEmail: f.notificationEmail ?? "info@example.com",
        includeOrderDetails: f.includeOrderDetails ?? true,
        includeReasonForFlag: f.includeReasonForFlag ?? true,
        includeRecommendedAction: f.includeRecommendedAction ?? true,
      }));
    }
  }, [fetchedData]);

  const handleSave = () => {
    const payload = {
      lostParcelThreshold: Number(settings.lostParcelThreshold),
      lostParcelPeriod: settings.lostParcelPeriod,
      lossRateThreshold: Number(settings.lossRateThreshold),
      matchSensitivity: settings.matchSensitivity,
      primaryAction: settings.primaryAction,
      requireESignature: settings.requireEsignature,
      forceCourierSignedDelivery: settings.forceSignedDelivery,
      photoOnDelivery: settings.requirePhoto,
      sendCancellationEmail: settings.sendCancellationEmail,
      includeWavierLink: settings.includeWavierLink,
      autoHoldRiskyOrders: settings.autoHoldRiskyOrders,

      emailNotificationsEnabled: settings.emailNotificationsEnabled,
      notificationEmail: settings.notificationEmail,
      includeOrderDetails: settings.includeOrderDetails,
      includeReasonForFlag: settings.includeReasonForFlag,
      includeRecommendedAction: settings.includeRecommendedAction,
    };
    saveSettings(payload);
  };

  const handleThresholdBlur = () => {
    const processedValue = wordsToNumber(thresholdInput);

    let finalValue = settings.lostParcelThreshold;

    if (typeof processedValue === "number" && !isNaN(processedValue)) {
      finalValue = Math.max(1, processedValue);
    }

    handleChange("lostParcelThreshold", finalValue);
    setThresholdInput(finalValue.toString());
  };

  const handleLossRateBlur = () => {
    const processedValue = wordsToNumber(lossRateInput);
    setLossRateError("");

    if (typeof processedValue === "number" && !isNaN(processedValue)) {
      if (processedValue >= 1 && processedValue <= 100) {
        handleChange("lossRateThreshold", processedValue);
        setLossRateInput(processedValue.toString());
      } else {
        setLossRateError("Value must be between 1 and 100.");
      }
    } else {
      setLossRateError("Please enter a valid number.");
    }
  };

  if (isLoading) return <p>Loading settings...</p>;

  return (
    <Box className="bg-white p-4 shadow-sm rounded-lg">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Risk Detection Settings
      </h1>


      {/* Detection Rules */}
      <Card className="mb-6 bg-white shadow-xs border-slate-200">
        <CardHeader>
          <CardTitle>Detection Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Flex className="w-full">
            <Box className="w-2/5">
              <Label>Lost Parcel Threshold</Label>
              <Input
                // type="number"
                // min={1}
                // max={10}
                value={thresholdInput}
                className="mt-2 bg-white border border-gray-200  py-5"
                onChange={(e) => setThresholdInput(e.target.value)}
                onBlur={handleThresholdBlur}
              />
            </Box>

            <Box>
              <Label>Lost Parcel Period</Label>
              <Select
                value={settings.lostParcelPeriod}
                onValueChange={(val) => handleChange("lostParcelPeriod", val)}
              >
                <SelectTrigger className="mt-2 bg-white border border-gray-200 w-96">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
            </Box>
          </Flex>

          <Box>
            <Label
              className={cn(
                "font-medium",
                !(userPackage === "ECP Vision" || userPackage === "ECP Insight")
                  ? "text-gray-400"
                  : "text-slate-700"
              )}
            >
              Loss Rate Threshold (%)
            </Label>
            <Input
              type="number"
              value={lossRateInput}
              min={1}
              max={100}
              disabled={
                !(userPackage === "ECP Vision" || userPackage === "ECP Insight")
              }
              className={`mt-2 bg-white border border-gray-200 `}
              onChange={(e) => {
                setLossRateInput(e.target.value);
                if (lossRateError) setLossRateError("");
              }}
              onBlur={handleLossRateBlur}
            />
            {lossRateError && (
              <p className="mt-1 text-sm text-red-600">{lossRateError}</p>
            )}
          </Box>

          <Box>
            <Label>Match Sensitivity</Label>
            <Select
              value={settings.matchSensitivity}
              onValueChange={(val) => handleChange("matchSensitivity", val)}
            >
              <SelectTrigger className="w-40 mt-2 border border-gray-200 bg-white ">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0 ">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </Box>
        </CardContent>
      </Card>


      {/* Risky Orders */}
      <Card className="mb-6 bg-white shadow-xs border-slate-200">
        <CardHeader>
          <CardTitle>Action on Risky Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Box>
            <Label>Primary Action</Label>
            <Select
              value={settings.primaryAction}
              onValueChange={(val) => handleChange("primaryAction", val)}
            >
              <SelectTrigger className="w-56 mt-2 border-0 shadow">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent className="bg-white border-0 shadow">
                <SelectItem value="hold">
                  Fulfilment Hold (Manual Review)
                </SelectItem>
                <SelectItem value="auto_cancel">
                  Automatic Cancellation & Refund
                </SelectItem>
              </SelectContent>
            </Select>
          </Box>

          <Box className="flex items-center justify-between">
            <Label>Automatic Fulfilment Hold (on discovery)</Label>
            <Switch
              checked={settings.autoHoldRiskyOrders}
              onCheckedChange={(val) => handleChange("autoHoldRiskyOrders", val)}
            />
          </Box>

          

          <Box className="flex items-center justify-between">
            <Label>Require customer e-signature</Label>
            <Switch
              checked={settings.requireEsignature}
              onCheckedChange={(val) => handleChange("requireEsignature", val)}
            />
          </Box>

          <Box className="flex items-center justify-between">
            <Label>Force courier to signed delivery</Label>
            <Switch
              checked={settings.forceSignedDelivery}
              onCheckedChange={(val) =>
                handleChange("forceSignedDelivery", val)
              }
            />
          </Box>

          <Box className="flex items-center justify-between">
            <Label>Photo on delivery required</Label>
            <Switch
              checked={settings.requirePhoto}
              onCheckedChange={(val) => handleChange("requirePhoto", val)}
            />
          </Box>

          <Box className="flex items-center justify-between">
            <Label>Send cancellation email</Label>
            <Switch
              checked={settings.sendCancellationEmail}
              onCheckedChange={(val) =>
                handleChange("sendCancellationEmail", val)
              }
            />
          </Box>

          <Box className="flex items-center justify-between">
            <Label>Include waiver link</Label>
            <Switch
              checked={settings.includeWavierLink}
              onCheckedChange={(val) => handleChange("includeWavierLink", val)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="mb-6 bg-white shadow-xs border-slate-200">
        <CardHeader>
          {/* Title from image */}
          <CardTitle className="text-2xl font-bold text-slate-800">
            Notifications & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Box className="flex items-start justify-between">
            {/* Checkbox and Label */}
            <Label className="flex items-start text-base font-normal">
              <Switch
                checked={settings.emailNotificationsEnabled}
                onCheckedChange={(val) =>
                  handleChange("emailNotificationsEnabled", val)
                }
                // Adjust switch styling to look like a checked box from the image
                // The Switch component is usually a toggle, but here we use it as a custom checkbox
                className="mt-1 mr-3"
              />
              Email Notifications to Retailer (On Risky Order Detection)
            </Label>
          </Box>

          <Box className="ml-8 w-1/2">
            <Input
              type="email"
              value={settings.notificationEmail}
              className="mt-2 bg-white border border-gray-300 py-3"
              onChange={(e) => handleChange("notificationEmail", e.target.value)}
            />
          </Box>


          <Box className="pt-4 space-y-3">
            <Label className="text-base font-normal">Include in email:</Label>

            {/* Order details */}
            <Box className="flex items-center ml-4">
              <Switch
                checked={settings.includeOrderDetails}
                onCheckedChange={(val) => handleChange("includeOrderDetails", val)}
                className="mr-3"
              />
              <Label className="text-base font-normal">
                Order details (iname, email, address, items)
              </Label>
            </Box>

            {/* Reason for flag */}
            <Box className="flex items-center ml-4">
              <Switch
                checked={settings.includeReasonForFlag}
                onCheckedChange={(val) => handleChange("includeReasonForFlag", val)}
                className="mr-3"
              />
              <Label className="text-base font-normal">
                Reason for flag (lost count, loss rate, time window)
              </Label>
            </Box>

            {/* Recommended action */}
            <Box className="flex items-center ml-4">
              <Switch
                checked={settings.includeRecommendedAction}
                onCheckedChange={(val) => handleChange("includeRecommendedAction", val)}
                className="mr-3"
              />
              <Label className="text-base font-normal">
                Recommended action
              </Label>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-blue-600 mb-4 hover:bg-blue-700 text-white w-42"
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </Button>

      {/* Additional Configuration */}
      <AdditionalConfiguration />

    </Box>
  );
}

export default RiskSettings;
