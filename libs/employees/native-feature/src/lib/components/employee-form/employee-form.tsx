import React, { useEffect, useState } from 'react';

import { Alert, View, Text, ScrollView } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import {
    UIActions,
    UiFileUpload,
    UIInput,
    UISwitch,
    UIVerticalSpacer,
} from '@pos/shared/ui-native';
import { FormProvider, useForm } from 'react-hook-form';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { EmployeeEntity, EmployeeService } from '@pos/employees/data-access';
import { RootState } from '@pos/store';
import { Employee } from '@pos/shared/models';
import { CheckBox } from '@rneui/themed';
import { Role } from '@pos/auth/data-access';

export interface EmployeeFormParams {
    [name: string]: object | undefined;
    employee: Employee;
}

export interface EmployeeFormProps {
    navigation: NativeStackNavigationProp<EmployeeFormParams>;
}

export function EmployeeForm({ navigation }: EmployeeFormProps) {
    const employee = useSelector(
        (state: RootState) => state.employees.selected
    );
    const dispatch = useDispatch();
    const styles = useSharedStyles();
    const [busy, setBusy] = useState<boolean>(false);
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
        defaultValues: {
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
        },
    });

    const roleList = Object.values(Role);

    const toggleRole = (name: string) => {
        const newRoles = { ...roles };
        newRoles[name] = !newRoles[name];

        const roleSet: string[] = [];
        Object.entries(newRoles).reduce((set, [role, selected]) => {
            if (selected) set.push(role);
            return set;
        }, roleSet);

        console.log('Role set', roleSet);

        form.setValue('roles', roleSet);
        setRoles(newRoles);
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

        const employeeRoles: Record<string, boolean> = {};
        Object.values(Role).reduce((eRoles, role) => {
            eRoles[role] = employee.roles.includes(role);
            return eRoles;
        }, employeeRoles);

        setRoles(employeeRoles);
    }, [employee]);

    return (
        <ScrollView
            contentContainerStyle={[styles.page, styles.centeredHorizontally]}
        >
            <FormProvider {...form}>
                <View style={[styles.page, { width: '75%', marginTop: 50 }]}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            marginBottom: 10,
                        }}
                    >
                        <View>
                            <Text
                                style={[
                                    styles.primaryText,
                                    styles.textBold,
                                    { marginTop: 6, marginRight: 25 },
                                ]}
                            >
                                Is active ?
                            </Text>
                        </View>
                        <View>
                            <UISwitch name="active" />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <UIInput
                                label="First Name"
                                name="firstName"
                                placeholder="First name"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <UIInput
                                label="Last Name"
                                name="lastName"
                                placeholder="Last name"
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <UIInput
                                name="phone"
                                label="Phone"
                                keyboardType="phone-pad"
                                placeholder="Phone Number"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <UIInput
                                name="email"
                                label="Email"
                                keyboardType="email-address"
                                placeholder="Email Address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <UIInput
                                label="Code"
                                name="code"
                                placeholder="Code"
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <UIInput
                                name="pin"
                                label="Pin"
                                keyboardType="decimal-pad"
                                placeholder="Pin"
                                rules={{ minLength: 4, maxLength: 4 }}
                                secureTextEntry={true}
                            />
                        </View>
                    </View>
                    <View style={{ flexDirection: 'column', marginBottom: 50 }}>
                        <View
                            style={{
                                marginLeft: 10,
                                marginTop: 10,
                                marginBottom: 15,
                            }}
                        >
                            <Text style={[styles.primaryText]}>Roles:</Text>
                        </View>

                        <View style={styles.row}>
                            {roleList.map((r) => (
                                <CheckBox
                                    key={r}
                                    center
                                    title={r}
                                    checked={roles[r]}
                                    onPress={() => toggleRole(r)}
                                />
                            ))}
                        </View>
                    </View>
                    <UIActions
                        busy={busy}
                        submitAction={form.handleSubmit(save)}
                        cancelAction={confirmCancel}
                    />
                </View>
            </FormProvider>
        </ScrollView>
    );
}

export default EmployeeForm;
