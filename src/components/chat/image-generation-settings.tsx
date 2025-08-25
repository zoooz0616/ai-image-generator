import { useState } from 'react';
import { Settings2, Palette, Shield, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import type { ImageGenerationRequest } from '@/services/supabase-image';

interface ImageGenerationSettingsProps {
  onSettingsChange: (settings: Omit<ImageGenerationRequest, 'prompt'>) => void;
  className?: string;
}

export function ImageGenerationSettings({ onSettingsChange, className }: ImageGenerationSettingsProps) {
  const [settings, setSettings] = useState<Omit<ImageGenerationRequest, 'prompt'>>({
    aspect_ratio: '4:3',
    safety_filter_level: 'block_medium_and_above',
    output_format: 'png',
  });

  const handleSettingChange = <K extends keyof typeof settings>(
    key: K,
    value: typeof settings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const aspectRatios = [
    { value: '1:1', label: '1:1 (Square)', description: 'Perfect for social media, logos' },
    { value: '4:3', label: '4:3 (Standard)', description: 'Classic photo format' },
    { value: '3:4', label: '3:4 (Portrait)', description: 'Vertical orientation' },
    { value: '16:9', label: '16:9 (Landscape)', description: 'Widescreen format' },
    { value: '9:16', label: '9:16 (Mobile)', description: 'Vertical mobile format' },
  ];

  const safetyLevels = [
    { value: 'block_low_and_above', label: 'Strict', description: 'Blocks most potentially harmful content' },
    { value: 'block_medium_and_above', label: 'Balanced', description: 'Standard filtering (recommended)' },
    { value: 'block_only_high', label: 'Permissive', description: 'Only blocks highly harmful content' },
  ];

  const outputFormats = [
    { value: 'png', label: 'PNG', description: 'High quality, transparency support' },
    { value: 'jpg', label: 'JPG', description: 'Smaller file size, good for photos' },
    { value: 'webp', label: 'WebP', description: 'Modern format, excellent compression' },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`gap-2 text-muted-foreground hover:text-foreground ${className}`}
        >
          <Settings2 className="h-4 w-4" />
          Imagen-4 Settings
          <Badge variant="secondary" className="ml-1">
            Google AI
          </Badge>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" />
              Imagen-4 Configuration
            </h4>
            <p className="text-xs text-muted-foreground">
              Configure Google's flagship image generation model for optimal results
            </p>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-2">
              <FileImage className="h-3 w-3" />
              Aspect Ratio
            </Label>
            <Select
              value={settings.aspect_ratio}
              onValueChange={(value) => handleSettingChange('aspect_ratio', value as any)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {aspectRatios.map((ratio) => (
                  <SelectItem key={ratio.value} value={ratio.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{ratio.label}</span>
                      <span className="text-xs text-muted-foreground">{ratio.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Safety Filter */}
          <div className="space-y-2">
            <Label className="text-xs font-medium flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Safety Filter
            </Label>
            <Select
              value={settings.safety_filter_level}
              onValueChange={(value) => handleSettingChange('safety_filter_level', value as any)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {safetyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Output Format */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Output Format</Label>
            <Select
              value={settings.output_format}
              onValueChange={(value) => handleSettingChange('output_format', value as any)}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {outputFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{format.label}</span>
                      <span className="text-xs text-muted-foreground">{format.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Features Info */}
          <div className="pt-2 border-t">
            <div className="space-y-1">
              <p className="text-xs font-medium text-primary">Imagen-4 Features:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Fine detail rendering (fabrics, water, fur)</li>
                <li>• Superior typography & text rendering</li>
                <li>• Photorealistic & abstract styles</li>
                <li>• Up to 2K resolution support</li>
              </ul>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}