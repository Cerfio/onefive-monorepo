'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/base/buttons/button';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { SelectItem } from '@/components/base/select/select-item';
import { X, Plus, TrendingUp, Rocket, Calendar, Building2, ArrowUp, ArrowDown } from 'lucide-react';
import { BuildInPublicData } from './BuildInPublicPost';
import { Metric } from './BuildInPublicMetrics';
import { cn } from '@/lib/utils';
import { useUserStartups } from '@/queries/startup';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateBuildInPublicPostProps {
  onDataChange: (data: BuildInPublicData | null) => void;
  initialData?: BuildInPublicData;
  initialType?: BuildInPublicData['type'];
}

const POST_TYPES = [
  { value: 'update' as const, label: 'Update', icon: Calendar },
  { value: 'metrics' as const, label: 'Métriques', icon: TrendingUp },
  { value: 'launch' as const, label: 'Launch', icon: Rocket },
];

const METRIC_PRESETS = [
  { label: 'Utilisateurs', format: 'number' as const },
  { label: 'MRR', format: 'currency' as const },
  { label: 'ARR', format: 'currency' as const },
  { label: 'CA', format: 'currency' as const },
  { label: 'Signups', format: 'number' as const },
  { label: 'MAU', format: 'number' as const },
];

// Calcul du pourcentage de variation
const calculatePercentageChange = (before: number, after: number): number | undefined => {
  if (!before || before === 0) return undefined;
  return ((after - before) / before) * 100;
};

export const CreateBuildInPublicPost: React.FC<CreateBuildInPublicPostProps> = ({
  onDataChange,
  initialData,
  initialType,
}) => {
  const { data: userStartups, isLoading: isLoadingStartups } = useUserStartups();
  const [selectedStartupId, setSelectedStartupId] = useState<string | null>(initialData?.projectId || null);
  const [type, setType] = useState<BuildInPublicData['type']>(initialType || initialData?.type || undefined);
  const [metrics, setMetrics] = useState<Metric[]>(initialData?.metrics || []);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const [newMetric, setNewMetric] = useState({
    label: '',
    before: '',
    after: '',
    format: 'number' as 'number' | 'currency' | 'percentage',
  });

  const updateData = useCallback(() => {
    const selectedStartup = userStartups?.find(s => s.id === selectedStartupId);
    const data: BuildInPublicData = {
      type,
      projectId: selectedStartupId || undefined,
      projectName: selectedStartup?.name,
      ...(metrics.length > 0 && { metrics }),
    };
    onDataChange(type && selectedStartupId ? data : null);
  }, [type, selectedStartupId, userStartups, metrics, onDataChange]);

  useEffect(() => {
    updateData();
  }, [type, selectedStartupId, updateData]);

  const handleTypeChange = (newType: BuildInPublicData['type']) => {
    setType(newType);
    if (newType !== 'metrics') setMetrics([]);
  };

  const handlePresetClick = (preset: typeof METRIC_PRESETS[0]) => {
    setActivePreset(preset.label);
    setNewMetric({
      label: preset.label,
      before: '',
      after: '',
      format: preset.format,
    });
  };

  const handleAddMetric = () => {
    if (!newMetric.label || !newMetric.before || !newMetric.after) return;

    const beforeValue = parseFloat(newMetric.before);
    const afterValue = parseFloat(newMetric.after);
    
    if (isNaN(beforeValue) || isNaN(afterValue)) return;

    const change = calculatePercentageChange(beforeValue, afterValue);

    const metric: Metric = {
      label: newMetric.label,
      value: afterValue,
      previousValue: beforeValue,
      format: newMetric.format,
      ...(change !== undefined && { change }),
    };

    setMetrics([...metrics, metric]);
    setNewMetric({ label: '', before: '', after: '', format: 'number' });
    setActivePreset(null);
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  useEffect(() => {
    updateData();
  }, [metrics, updateData]);

  const startupItems = userStartups?.map((startup) => {
    const nameParts = startup.name.trim().split(/\s+/);
    return {
      id: startup.id,
      label: startup.name,
      avatarUrl: startup.logo || undefined,
      // Pour l'avatar, on utilise firstName/lastName pour générer les initiales si pas de logo
      firstName: startup.logo ? undefined : nameParts[0] || '',
      lastName: startup.logo ? undefined : nameParts.slice(1).join(' ') || '',
    };
  }) || [];

  const showTypeSelector = !initialType;

  return (
    <div className="space-y-4">
      {/* Project Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Projet</label>
        {isLoadingStartups ? (
          <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
        ) : !startupItems || startupItems.length === 0 ? (
          <p className="text-sm text-red-500">Aucun projet disponible</p>
        ) : (
          <Select
            selectedKey={selectedStartupId}
            onSelectionChange={(key) => setSelectedStartupId(key === null ? null : String(key))}
            placeholder="Sélectionnez un projet"
            placeholderIcon={Building2}
            items={startupItems}
            size="md"
            isRequired
            isDisabled={isLoadingStartups}
          >
            {(item) => (
              <SelectItem 
                id={item.id} 
                textValue={item.label}
                avatarUrl={item.avatarUrl}
                firstName={item.firstName}
                lastName={item.lastName}
              >
                {item.label}
              </SelectItem>
            )}
          </Select>
        )}
      </div>

      {/* Type Selection */}
      {showTypeSelector && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type</label>
          <div className="flex gap-2">
            {POST_TYPES.map((postType) => {
              const Icon = postType.icon;
              const isSelected = type === postType.value;
              
              return (
                <button
                  key={postType.value}
                  type="button"
                  onClick={() => handleTypeChange(postType.value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
                    isSelected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {postType.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Metrics Form */}
      <AnimatePresence mode="wait">
        {type === 'metrics' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Métriques rapides
              </label>
              <div className="flex flex-wrap gap-1.5">
                {METRIC_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                      activePreset === preset.label
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form */}
            <div className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Label</label>
                  <Input
                    value={newMetric.label}
                    onChange={(value) => setNewMetric({ ...newMetric, label: value })}
                    placeholder="MRR"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Avant</label>
                  <Input
                    type="number"
                    value={newMetric.before}
                    onChange={(value) => setNewMetric({ ...newMetric, before: value })}
                    placeholder="8000"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Après</label>
                  <Input
                    type="number"
                    value={newMetric.after}
                    onChange={(value) => setNewMetric({ ...newMetric, after: value })}
                    placeholder="10000"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Format</label>
                <select
                  value={newMetric.format}
                  onChange={(e) => setNewMetric({ ...newMetric, format: e.target.value as 'number' | 'currency' | 'percentage' })}
                  className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:ring-1 focus:ring-gray-300 focus:border-gray-300 outline-none"
                >
                  <option value="number">Nombre</option>
                  <option value="currency">€</option>
                  <option value="percentage">%</option>
                </select>
              </div>

              {/* Calcul automatique du pourcentage */}
              {newMetric.before && newMetric.after && 
               !isNaN(parseFloat(newMetric.before)) && 
               !isNaN(parseFloat(newMetric.after)) && (
                <div className="p-2 rounded bg-white border border-gray-200">
                  <p className="text-xs text-gray-500">
                    Variation :{' '}
                    <span className={cn(
                      'font-medium',
                      calculatePercentageChange(parseFloat(newMetric.before), parseFloat(newMetric.after))! > 0 
                        ? 'text-green-600' 
                        : calculatePercentageChange(parseFloat(newMetric.before), parseFloat(newMetric.after))! < 0
                        ? 'text-red-600'
                        : 'text-gray-600'
                    )}>
                      {calculatePercentageChange(parseFloat(newMetric.before), parseFloat(newMetric.after))! > 0 ? '+' : ''}
                      {calculatePercentageChange(parseFloat(newMetric.before), parseFloat(newMetric.after))!.toFixed(1)}%
                    </span>
                  </p>
                </div>
              )}

              <Button
                type="button"
                color="secondary"
                size="sm"
                onClick={handleAddMetric}
                isDisabled={!newMetric.label || !newMetric.before || !newMetric.after}
                className="w-full"
                iconLeading={<Plus data-icon className="w-4 h-4" />}
              >
                Ajouter
              </Button>
            </div>

            {/* Added Metrics */}
            {metrics.length > 0 && (
              <div className="space-y-2">
                {metrics.map((metric, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">{metric.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {metric.previousValue !== undefined && (
                            <>
                              {metric.format === 'currency' ? `${metric.previousValue}€` : 
                               metric.format === 'percentage' ? `${metric.previousValue}%` : metric.previousValue}
                              {' → '}
                            </>
                          )}
                        </span>
                        <span className="text-sm text-gray-600">
                          {metric.format === 'currency' ? `${metric.value}€` : 
                           metric.format === 'percentage' ? `${metric.value}%` : metric.value}
                        </span>
                        {metric.change !== undefined && (
                          <span className={cn(
                            'flex items-center gap-0.5 text-xs font-medium',
                            metric.change > 0 ? 'text-green-600' : 'text-red-600'
                          )}>
                            {metric.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                            {Math.abs(metric.change).toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(index)}
                      className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
