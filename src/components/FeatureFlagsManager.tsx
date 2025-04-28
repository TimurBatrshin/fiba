import React, { useState, useEffect } from 'react';
import { Table, Switch, message } from 'antd';
import { featureFlagService, FeatureFlags } from '../services/FeatureFlagService';
import { updateFeatures } from '../config/features';

const FeatureFlagsManager: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      const features = await featureFlagService.getFeatureFlags();
      setFlags(features);
    } catch (error) {
      message.error('Не удалось загрузить настройки фичей');
      console.error('Failed to load feature flags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof FeatureFlags, checked: boolean) => {
    try {
      if (!flags) return;
      
      const updatedFlags = await featureFlagService.updateFeatureFlags({
        [key]: checked
      });
      
      setFlags(updatedFlags);
      await updateFeatures(); // Обновляем глобальные значения фичей
      message.success('Настройки успешно обновлены');
    } catch (error) {
      message.error('Не удалось обновить настройки');
      console.error('Failed to update feature flag:', error);
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'key',
      key: 'key',
      render: (key: string) => {
        const displayNames: Record<string, string> = {
          disableBackend: 'Отключить бэкенд',
          showTopPlayers: 'Показывать топ игроков',
          showAdminPanel: 'Показывать админ-панель',
          enableAdminPage: 'Включить страницу администратора',
          enableTournamentFilter: 'Включить фильтр турниров',
          enablePlayerSearch: 'Включить поиск игроков',
          experimentalRegistration: 'Экспериментальная регистрация'
        };
        return displayNames[key] || key;
      }
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      key: 'value',
      render: (value: boolean, record: { key: keyof FeatureFlags }) => (
        <Switch
          checked={value}
          onChange={(checked) => handleToggle(record.key, checked)}
        />
      )
    }
  ];

  const data = flags
    ? Object.entries(flags).map(([key, value]) => ({
        key: key as keyof FeatureFlags,
        value
      }))
    : [];

  return (
    <div className="feature-flags-manager">
      <h2>Управление функциями</h2>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        rowKey="key"
      />
    </div>
  );
};

export default FeatureFlagsManager; 