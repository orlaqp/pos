import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '@rneui/themed';
import { UICard, UIEmptyState, UIScreen } from '@pos/shared/ui-native';
import {
  DiscountDefinitionEntity,
  EmployeeDiscountPolicyEntity,
} from '@pos/discounts/data-access';
import { DiscountsStyles } from './discounts.styles';

interface SectionConfigValue {
  title: string;
  description: string;
  actionLabel: string;
  createRoute: string;
  type: 'definition' | 'policy' | 'static';
  filter?: 'MANUAL' | 'PROMO_CODE';
}

interface DiscountsListScreenProps {
  config: SectionConfigValue;
  empty: boolean;
  loading: boolean;
  keyLabel: string;
  definitions: DiscountDefinitionEntity[];
  policies: EmployeeDiscountPolicyEntity[];
  styles: DiscountsStyles;
  buildDefinitionMeta: (item: DiscountDefinitionEntity) => string;
  buildPolicyMeta: (item: EmployeeDiscountPolicyEntity) => string;
  onNavigate: (route: string, params?: { id: string }) => void;
}

export function DiscountsListScreen({
  config,
  empty,
  loading,
  keyLabel,
  definitions,
  policies,
  styles,
  buildDefinitionMeta,
  buildPolicyMeta,
  onNavigate,
}: DiscountsListScreenProps) {
  if (config.type === 'static') {
    return (
      <View style={styles.page}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{keyLabel.toUpperCase()}</Text>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.description}>{config.description}</Text>
        </View>
      </View>
    );
  }

  const items = config.type === 'definition' ? definitions : policies;

  return (
    <UIScreen>
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.container}>
            <UICard tone="muted" radius="lg" style={styles.headerCard}>
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.headerTitle}>{config.title}</Text>
                  <Text style={styles.headerSubtitle}>{config.description}</Text>
                </View>
                {config.actionLabel && !empty ? (
                  <Button
                    testID="discounts-header-add-button"
                    title={config.actionLabel}
                    onPress={() => onNavigate(config.createRoute)}
                    buttonStyle={styles.headerButton}
                    titleStyle={styles.headerButtonTitle}
                    containerStyle={styles.headerButtonContainer}
                  />
                ) : null}
              </View>
            </UICard>

            {empty ? (
              <UICard style={styles.emptyCard}>
                <UIEmptyState
                  title={loading ? 'Loading…' : `No ${keyLabel.toLowerCase()} yet`}
                  subtitle={config.description}
                  actions={
                    config.actionLabel
                      ? [
                          {
                            title: config.actionLabel,
                            testID: 'discounts-empty-add-button',
                            onPress: () => onNavigate(config.createRoute),
                            type: 'solid',
                          },
                        ]
                      : undefined
                  }
                />
              </UICard>
            ) : (
              <View style={styles.listWrap}>
                {items.map((item) => {
                  const id = item.id || `${item.roleKey || item.employeeId || item.name}`;
                  const navigateParams = item.id ? { id: item.id } : undefined;

                  return (
                    <TouchableOpacity
                      key={id}
                      testID={`discounts-list-item-${id}`}
                      activeOpacity={0.86}
                      onPress={() =>
                        config.createRoute ? onNavigate(config.createRoute, navigateParams) : undefined
                      }
                    >
                      <UICard style={styles.listCard}>
                        <View style={styles.listRow}>
                          <View style={styles.listCopy}>
                            <Text style={styles.listTitle}>
                              {'name' in item ? item.name : item.roleKey || item.employeeId || 'Policy'}
                            </Text>
                            <View style={styles.metaChipRow}>
                              {'type' in item ? (
                                <>
                                  <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{item.type}</Text>
                                  </View>
                                  <View style={styles.metaChip}>
                                    <Text style={styles.metaChipText}>{item.status}</Text>
                                  </View>
                                </>
                              ) : (
                                <View style={styles.metaChip}>
                                  <Text style={styles.metaChipText}>
                                    {item.employeeId ? 'Employee override' : 'Role policy'}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.listMeta}>
                              {'type' in item ? buildDefinitionMeta(item) : buildPolicyMeta(item)}
                            </Text>
                          </View>
                          <View style={styles.listAside}>
                            {'active' in item && !item.active ? (
                              <View style={styles.inactivePill}>
                                <Text style={styles.inactivePillText}>Inactive</Text>
                              </View>
                            ) : null}
                            <Text style={styles.editHint}>Edit</Text>
                          </View>
                        </View>
                      </UICard>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </UIScreen>
  );
}
