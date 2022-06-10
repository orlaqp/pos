import React, { useState } from 'react';

import { Alert, View, Text } from 'react-native';
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

    return (
        <View style={[styles.page, styles.centeredHorizontally]}>
            <FormProvider {...form}>
                <View style={[styles.page, { width: '50%', marginTop: 50 }]}>
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
                    <View>
                        <UIInput name="firstName" placeholder="First name" />
                    </View>
                    <View>
                        <UIInput name="lastName" placeholder="Last name" />
                    </View>
                    <View>
                        <UIInput
                            name="phone"
                            keyboardType="phone-pad"
                            placeholder="Phone Number"
                        />
                    </View>
                    <View>
                        <UIInput
                            name="email"
                            keyboardType="email-address"
                            placeholder="Email Address"
                            autoCapitalize='none'
                            autoCorrect={false}
                        />
                    </View>
                    <View>
                        <UIInput
                            name="pin"
                            keyboardType="decimal-pad"
                            placeholder="Pin"
                        />
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
        </View>
    );
}

export default EmployeeForm;
