import React, {useState} from 'react';
import {Input, Layout, Text, Button, Select, SelectItem, IndexPath, Datepicker, Icon, Divider, Spinner} from "@ui-kitten/components";
import {ScrollView, StyleSheet, TouchableWithoutFeedback} from "react-native";
import Container from "../../components/Container/Container";
import request from "../../services/request";
import Toast from "react-native-toast-message";
import {NavigationProp} from "@react-navigation/native";
import {Formik} from 'formik';
import * as Yup from 'yup';

interface IProps {
    navigation: NavigationProp<any>
}

const gender = ['Female', 'Male'];

interface IForm {
    pseudo: string,
    dateOfBirth: any,
    gender: any,
    preferredGender: any[],
    email: string,
    password: string,
}

const Register = ({navigation}: IProps) => {
    const now = new Date();
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [loading, setLoading] = useState(false);

    const registerSchema = Yup.object().shape({
        pseudo: Yup.string().min(3, 'Too short!').max(64, 'Too long!').required('Required'),
        dateOfBirth: Yup.date().required('Required'),
        gender: Yup.object().required('Required'),
        preferredGender: Yup.array().min(1, 'Required').required('Required'),
        email: Yup.string().email('Invalid email').required('Required'),
        password: Yup.string()
            .min(8, 'Too short!')
            .max(64, 'Too long!')
            // .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[-+!*$@%_])([-+!*$@%_\w])/, 'Must be RGPD compliant!')
            .required('Required'),
    });

    const registerClicked = async (values: IForm) => {
        const {pseudo, gender, email, preferredGender, dateOfBirth, password} = values;
        try {
            setLoading(true);
            const formattedDateOfBirth = [
                dateOfBirth.getDate() < 10 ? `0${dateOfBirth.getDate()}` : dateOfBirth.getDate(),
                dateOfBirth.getMonth() + 1 < 10 ? `0${dateOfBirth.getMonth() + 1}` : dateOfBirth.getMonth() + 1,
                dateOfBirth.getFullYear()
            ].join('-');

            await request('register', 'customer', 'post', {
                pseudo,
                gender: gender.row,
                email,
                attracted_by: preferredGender.length > 1 ? 2 : preferredGender[0].row,
                password,
                age: 23,
                dateOfBirth: formattedDateOfBirth
            });
            Toast.show({
                type: 'success',
                text1: 'Registration complete'
            });
            navigation.navigate('Login');
        } catch (e) {
            console.log(e?.response);
            Toast.show({
                type: 'error',
                text1: 'Registration error'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container scroll={true}>
            <Text category="h1">Register</Text>
            <Formik
                initialValues={{
                    pseudo: '',
                    dateOfBirth: undefined,
                    gender: new IndexPath(0),
                    preferredGender: [],
                    email: '',
                    password: '',
                }}
                validationSchema={registerSchema}
                onSubmit={values => registerClicked(values)}
            >
                {({handleChange, setFieldValue, handleBlur, handleSubmit, values, errors, touched}) => (
                    <Layout style={styles.inputsContainer}>
                        <Input
                            placeholder="Pseudo"
                            value={values.pseudo}
                            onChangeText={handleChange('pseudo')}
                            onBlur={handleBlur('pseudo')}
                            style={styles.input}
                            status={errors.pseudo && touched.pseudo ? 'danger' : undefined}
                        />
                        <Text style={styles.error}>{errors.pseudo && touched.pseudo ? errors.pseudo : ''}</Text>

                        <Select
                            placeholder="Gender"
                            value={gender[values.gender.row]}
                            selectedIndex={values.gender}
                            onSelect={(index) => setFieldValue('gender', index)}
                            // onBlur={handleBlur('gender')}
                            style={styles.select}
                            status={errors.gender && touched.gender ? 'danger' : undefined}
                        >
                            <SelectItem title="Female"/>
                            <SelectItem title="Male"/>
                        </Select>
                        <Text style={styles.error}>{errors.gender && touched.gender ? 'Required' : ''}</Text>

                        <Datepicker
                            placeholder="Date of birth"
                            min={new Date(now.getFullYear() - 100, now.getMonth() - 1, now.getDay())}
                            max={new Date(now.getFullYear() - 18, now.getMonth() - 1, now.getDay())}
                            date={values.dateOfBirth}
                            onSelect={values => setFieldValue('dateOfBirth', values)}
                            style={styles.select}
                            status={errors.dateOfBirth && touched.dateOfBirth ? 'danger' : undefined}
                        />
                        <Text style={styles.error}>{errors.dateOfBirth && touched.dateOfBirth ? errors.dateOfBirth : ''}</Text>

                        <Divider style={styles.divider}/>
                        <Select
                            placeholder="Preferred Gender"
                            multiSelect={true}
                            value={values.preferredGender.map((e: any) => gender[e.row]).join(', ')}
                            selectedIndex={values.preferredGender}
                            onSelect={index => setFieldValue('preferredGender', index)}
                            // onBlur={handleBlur('preferredGender')}
                            style={styles.select}
                            status={errors.preferredGender && touched.preferredGender ? 'danger' : undefined}
                        >
                            <SelectItem title="Female"/>
                            <SelectItem title="Male"/>
                        </Select>
                        <Text style={styles.error}>{errors.preferredGender && touched.preferredGender ? errors.preferredGender : ''}</Text>

                        <Divider style={styles.divider}/>
                        <Input
                            placeholder="Email"
                            value={values.email}
                            onChangeText={handleChange('email')}
                            onBlur={handleBlur('email')}
                            style={styles.input}
                            status={errors.email && touched.email ? 'danger' : undefined}
                            keyboardType="email-address"
                        />
                        <Text style={styles.error}>{errors.email && touched.email ? errors.email : ''}</Text>

                        <Input
                            placeholder="Password"
                            value={values.password}
                            onChangeText={handleChange('password')}
                            onBlur={handleBlur('password')}
                            style={styles.input}
                            accessoryRight={(props) => (
                                <TouchableWithoutFeedback onPress={() => setSecureTextEntry(prev => !prev)}>
                                    <Icon {...props} name={secureTextEntry ? 'eye-off' : 'eye'}/>
                                </TouchableWithoutFeedback>
                            )}
                            secureTextEntry={secureTextEntry}
                            status={errors.password && touched.password ? 'danger' : undefined}
                        />
                        <Text style={styles.error}>{errors.password && touched.password ? errors.password : ''}</Text>

                        <Layout style={styles.buttonContainer}>
                            {loading && <Spinner/>}
                            <Button onPress={() => handleSubmit()} style={styles.button} disabled={loading}>Register</Button>
                        </Layout>
                    </Layout>
                )}
            </Formik>
        </Container>
    );
};

export default Register;

const styles = StyleSheet.create({
    inputsContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        // marginVertical: 8,
    },
    select: {
        width: '100%',
        // marginVertical: 8,
    },
    error: {
        height: 20,
        width: '100%',
        fontSize: 14,
        color: '#DB2C67',
    },
    button: {
        marginVertical: 8,
        marginLeft: 8,
        alignSelf: "flex-end",
    },
    divider: {
        marginVertical: 4,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    }
});
