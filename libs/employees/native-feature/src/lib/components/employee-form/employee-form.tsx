import React, { useEffect, useState } from 'react';

import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
    UIActions,
    UICard,
    UIInput,
    UIScreen,
    UIStack,
    UISwitch,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeEntity, EmployeeService } from '@pos/employees/data-access';
import { RootState } from '@pos/store';
import { Employee } from '@pos/shared/models';
import { Button, Icon } from '@rneui/themed';
import { Role } from '@pos/auth/data-access';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export interface EmployeeFormParams {
    [name: string]: object | undefined;
    employee: Employee;
}

export interface EmployeeFormProps {
    navigation: NativeStackNavigationProp<EmployeeFormParams>;
}

export const getEmployeeDefaults = (employee?: EmployeeEntity) => ({
    id: employee?.id,
    code: employee?.code,
    firstName: employee?.firstName,
    lastName: employee?.lastName,
    middleName: employee?.middleName,
    dob: employee?.dob,
    phone: employee?.phone,
    email: employee?.email,
    pin: employee?.pin,
    roles: employee?.roles,
    active:
        employee?.active === null || employee?.active === undefined
            ? true
            : employee?.active,
});

export const buildEmployeeRoleMap = (employeeRoles?: string[]) => {
    const roleMap: Record<string, boolean> = {};
    Object.values(Role).forEach((role) => {
        roleMap[role] = !!employeeRoles?.includes(role);
    });
    return roleMap;
};

export const toggleEmployeeRoleSet = (
    currentRoles: Record<string, boolean>,
    roleName: string
) => {
    const nextRoles = { ...currentRoles, [roleName]: !currentRoles[roleName] };
    const roleSet = Object.entries(nextRoles).reduce((set, [role, selected]) => {
        if (selected) set.push(role);
        return set;
    }, [] as string[]);
    return { nextRoles, roleSet };
};

export function EmployeeForm({ navigation }: EmployeeFormProps) {
    const employee = useSelector(
        (state: RootState) => state.employees.selected
    );
    const dispatch = useDispatch();
    const tokens = useDesignTokens();
    const styles = useStyles(tokens);
    const [busy, setBusy] = useState<boolean>(false);
    const [pinVisible, setPinVisible] = useState(false);
    const [roles, setRoles] = useState<Record<string, boolean>>({});

    const save = async () => {
        setBusy(true);
        const formValues: EmployeeEntity = form.getValues();

        if (!formValues.id) {
            delete formValues.id;
        }

        await EmployeeService.save(dispatch, formValues);
        navigation.goBack();
        setBusy(false);
    };

    const form = useForm<EmployeeEntity>({
        mode: 'onChange',
        defaultValues: getEmployeeDefaults(employee),
    });

    const roleList = Object.values(Role);
    const activeRoleCount = Object.values(roles).filter(Boolean).length;

    const toggleRole = (name: string) => {
        const { nextRoles, roleSet } = toggleEmployeeRoleSet(roles, name);

        form.setValue('roles', roleSet);
        setRoles(nextRoles);
    };

    const setRolesFromList = (selectedRoles: string[]) => {
        const nextRoles = roleList.reduce((acc, roleName) => {
            acc[roleName] = selectedRoles.includes(roleName);
            return acc;
        }, {} as Record<string, boolean>);

        setRoles(nextRoles);
        form.setValue('roles', selectedRoles);
    };

    const selectCommonRoles = () => {
        const preferredRoles = ['ADMIN', 'SALES', 'PAYMENTS', 'CASHIER'];
        const common = preferredRoles.filter((roleName) =>
            roleList.includes(roleName as Role)
        );
        const defaultSelection = common.length ? common : roleList.slice(0, 2);
        setRolesFromList(defaultSelection);
    };

    const clearRoles = () => setRolesFromList([]);

    const resetPin = () => {
        form.setValue('pin', '');
        setPinVisible(false);
    };

    const confirmCancel = () => {
        Alert.alert(
            'Are you sure?',
            'You will not be able to undo this operation',
            [
                { text: 'No' },
                { text: 'Yes', onPress: () => navigation.goBack() },
            ]
        );
    };

    useEffect(() => {
        if (!employee?.roles) return;
        setRoles(buildEmployeeRoleMap(employee.roles));
    }, [employee]);

    return (
        <UIScreen>
            <FormProvider {...form}>
                <View style={styles.screen}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.container}>
                            <UICard style={styles.headerCard} tone="muted" radius="lg">
                                <View style={styles.headerRow}>
                                    <View style={styles.headerTitleBlock}>
                                        <Text style={styles.headerTitle}>Employee Profile</Text>
                                        <Text style={styles.headerSubtitle}>
                                            Manage identity, access and security settings.
                                        </Text>
                                    </View>
                                    <View style={styles.headerStatusBlock}>
                                        <View
                                            style={[
                                                styles.statusBadge,
                                                form.watch('active')
                                                    ? styles.statusBadgeActive
                                                    : styles.statusBadgeInactive,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.statusBadgeText,
                                                    form.watch('active')
                                                        ? styles.statusBadgeTextActive
                                                        : styles.statusBadgeTextInactive,
                                                ]}
                                            >
                                                {form.watch('active') ? 'Active' : 'Inactive'}
                                            </Text>
                                        </View>
                                        <View style={styles.statusSwitchRow}>
                                            <Text style={styles.toggleLabel}>Is active?</Text>
                                            <View style={styles.toggleSwitchWrap}>
                                                <UISwitch name="active" />
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <Text style={styles.sectionTitle}>Profile</Text>
                                <UIStack spacing="sm">
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIInput
                                                label="First Name"
                                                name="firstName"
                                                placeholder="First name"
                                                lIcon="account-outline"
                                            />
                                        </View>
                                        <View style={styles.columnLast}>
                                            <UIInput
                                                label="Last Name"
                                                name="lastName"
                                                placeholder="Last name"
                                                lIcon="account-outline"
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIInput
                                                name="phone"
                                                label="Phone"
                                                keyboardType="phone-pad"
                                                placeholder="Phone Number"
                                                lIcon="phone-outline"
                                            />
                                        </View>
                                        <View style={styles.columnLast}>
                                            <UIInput
                                                name="email"
                                                label="Email"
                                                keyboardType="email-address"
                                                placeholder="Email Address"
                                                autoCapitalize="none"
                                                autoCorrect={false}
                                                lIcon="email-outline"
                                            />
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        <View style={styles.column}>
                                            <UIInput
                                                label="Code"
                                                name="code"
                                                placeholder="Code"
                                                lIcon="badge-account-outline"
                                            />
                                        </View>
                                        <View style={styles.columnLast} />
                                    </View>
                                </UIStack>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <View style={styles.sectionHeaderRow}>
                                    <View>
                                        <Text style={styles.sectionTitle}>Access</Text>
                                        <Text style={styles.sectionSubtitle}>
                                            {activeRoleCount} role
                                            {activeRoleCount === 1 ? '' : 's'} selected
                                        </Text>
                                    </View>
                                    <View style={styles.sectionHeaderActions}>
                                        <Button
                                            title="Select common"
                                            type="clear"
                                            titleStyle={styles.helperActionText}
                                            onPress={selectCommonRoles}
                                        />
                                        <Button
                                            title="Clear all"
                                            type="clear"
                                            titleStyle={styles.helperActionText}
                                            onPress={clearRoles}
                                        />
                                    </View>
                                </View>

                                <UIStack direction="horizontal" wrap spacing="sm">
                                    {roleList.map((r) => (
                                        <Pressable
                                            key={r}
                                            testID={`employee-role-${r}`}
                                            style={[
                                                styles.roleChip,
                                                roles[r]
                                                    ? styles.roleChipActive
                                                    : styles.roleChipInactive,
                                            ]}
                                            onPress={() => toggleRole(r)}
                                        >
                                            <Icon
                                                name={roles[r] ? 'check-circle' : 'circle-outline'}
                                                type="material-community"
                                                size={16}
                                                color={
                                                    roles[r]
                                                        ? tokens.colors.accent
                                                        : tokens.colors.textMuted
                                                }
                                            />
                                            <Text
                                                style={[
                                                    styles.roleChipText,
                                                    roles[r] ? styles.roleChipTextActive : undefined,
                                                ]}
                                            >
                                                {r}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </UIStack>
                            </UICard>

                            <UICard style={styles.sectionCard}>
                                <View style={styles.sectionHeaderRow}>
                                    <View>
                                        <Text style={styles.sectionTitle}>Security</Text>
                                        <Text style={styles.sectionSubtitle}>
                                            Keep employee sign-in credentials up to date.
                                        </Text>
                                    </View>
                                    <Button
                                        title="Reset PIN"
                                        type="outline"
                                        buttonStyle={styles.resetPinButton}
                                        titleStyle={styles.resetPinText}
                                        onPress={resetPin}
                                    />
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.column}>
                                        <UIInput
                                            name="pin"
                                            label="Pin"
                                            keyboardType="decimal-pad"
                                            placeholder="Pin"
                                            rules={{ minLength: 4, maxLength: 4 }}
                                            secureTextEntry={!pinVisible}
                                            lIcon="lock-outline"
                                            rightIcon={{
                                                name: pinVisible ? 'eye-off-outline' : 'eye-outline',
                                                type: 'material-community',
                                                color: tokens.colors.textMuted,
                                                onPress: () => setPinVisible((current) => !current),
                                            }}
                                        />
                                    </View>
                                    <View style={styles.columnLast} />
                                </View>
                            </UICard>
                        </View>
                    </ScrollView>

                    <View style={styles.actionBar}>
                        <UICard tone="muted" style={styles.actionBarCard}>
                            <UIActions
                                busy={busy}
                                submitAction={form.handleSubmit(save)}
                                cancelAction={confirmCancel}
                            />
                        </UICard>
                    </View>
                </View>
            </FormProvider>
        </UIScreen>
    );
}

const useStyles = (tokens: ReturnType<typeof useDesignTokens>) =>
    StyleSheet.create({
        screen: {
            flex: 1,
        },
        scrollContent: {
            paddingHorizontal: tokens.spacing.xl,
            paddingTop: tokens.spacing.lg,
            paddingBottom: tokens.spacing.xl,
            alignItems: 'center',
        },
        container: {
            width: '100%',
            maxWidth: 1220,
        },
        headerCard: {
            marginBottom: tokens.spacing.lg,
        },
        headerRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        headerTitleBlock: {
            flex: 1,
            paddingRight: tokens.spacing.lg,
        },
        headerTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 26,
            fontWeight: '700',
        },
        headerSubtitle: {
            color: tokens.colors.textSecondary,
            marginTop: tokens.spacing.xs,
            fontSize: 15,
        },
        headerStatusBlock: {
            alignItems: 'flex-end',
        },
        statusBadge: {
            borderRadius: tokens.radii.xl,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.xs,
            marginBottom: tokens.spacing.sm,
        },
        statusBadgeActive: {
            backgroundColor: `${tokens.colors.success}33`,
            borderColor: `${tokens.colors.success}66`,
        },
        statusBadgeInactive: {
            backgroundColor: `${tokens.colors.danger}22`,
            borderColor: `${tokens.colors.danger}55`,
        },
        statusBadgeText: {
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 0.7,
        },
        statusBadgeTextActive: {
            color: tokens.colors.success,
        },
        statusBadgeTextInactive: {
            color: tokens.colors.danger,
        },
        statusSwitchRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        toggleLabel: {
            color: tokens.colors.textSecondary,
            fontSize: 16,
            fontWeight: '600',
        },
        toggleSwitchWrap: {
            marginLeft: tokens.spacing.md,
        },
        sectionCard: {
            marginBottom: tokens.spacing.lg,
        },
        sectionTitle: {
            color: tokens.colors.textPrimary,
            fontSize: 19,
            fontWeight: '700',
            marginBottom: tokens.spacing.sm,
        },
        sectionSubtitle: {
            color: tokens.colors.textMuted,
            fontSize: 14,
        },
        sectionHeaderRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: tokens.spacing.sm,
        },
        sectionHeaderActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        helperActionText: {
            color: tokens.colors.accent,
            fontSize: 14,
            fontWeight: '600',
        },
        row: {
            flexDirection: 'row',
        },
        column: {
            flex: 1,
            marginRight: tokens.spacing.md,
        },
        columnLast: {
            flex: 1,
        },
        roleChip: {
            borderRadius: tokens.radii.lg,
            borderWidth: 1,
            paddingHorizontal: tokens.spacing.md,
            paddingVertical: tokens.spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 36,
            marginBottom: tokens.spacing.xs,
        },
        roleChipActive: {
            backgroundColor: `${tokens.colors.accent}22`,
            borderColor: `${tokens.colors.accent}66`,
        },
        roleChipInactive: {
            backgroundColor: tokens.colors.surfaceMuted,
            borderColor: tokens.colors.border,
        },
        roleChipText: {
            marginLeft: tokens.spacing.xs,
            color: tokens.colors.textSecondary,
            fontWeight: '600',
        },
        roleChipTextActive: {
            color: tokens.colors.textPrimary,
        },
        resetPinButton: {
            borderRadius: tokens.radii.md,
            borderColor: tokens.colors.border,
            paddingHorizontal: tokens.spacing.md,
        },
        resetPinText: {
            color: tokens.colors.textSecondary,
            fontWeight: '600',
        },
        actionBar: {
            paddingHorizontal: tokens.spacing.xl,
            paddingBottom: tokens.spacing.md,
            paddingTop: tokens.spacing.xs,
        },
        actionBarCard: {
            maxWidth: 1220,
            alignSelf: 'center',
            width: '100%',
            borderRadius: tokens.radii.lg,
        },
    });

export default EmployeeForm;
