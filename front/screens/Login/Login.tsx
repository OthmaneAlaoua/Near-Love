import React, {useState} from 'react';
import {Input, Layout, Text, Button, Icon, Spinner} from "@ui-kitten/components";
import {StyleSheet, TouchableWithoutFeedback} from "react-native";
import Container from "../../components/Container/Container";
import {NavigationProp} from "@react-navigation/native";
import request from "../../services/request";
import Toast from "react-native-toast-message";
import store from "../../store/store";
import {login} from "../../store/slices/user";
import {Formik} from 'formik';
import * as Yup from 'yup';

interface IProps {
    navigation: NavigationProp<any>
}

interface IForm {
    email: string,
    password: string,
}

const Login = ({navigation}: IProps) => {
    const [loading, setLoading] = useState(false);

    const [secureTextEntry, setSecureTextEntry] = useState(true);

    const loginSchema = Yup.object().shape({
        email: Yup.string().email('Invalid email').required('Required'),
        password: Yup.string()
            .min(8, 'Too short!')
            .max(64, 'Too long!')
            // .matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[-+!*$@%_])([-+!*$@%_\w])/, 'Must be RGPD compliant!')
            .required('Required'),
    });

    const loginClicked = async (values: IForm) => {
        try {
            setLoading(true);
            const {email, password} = values;
            const response = await request('get-jwt', 'auth', 'post', {
                email,
                password
            }, false);
            Toast.show({
                type: 'success',
                text1: 'Login Successful'
            });
            store.dispatch(login(response.data?.datas));
            navigation.navigate('Root');
        } catch (e) {
            console.log(e);
            Toast.show({
                type: 'error',
                text1: 'Login error'
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Container scroll={true}>
            <Text category="h1">Login</Text>
            <Formik
                initialValues={{
                    email: '',
                    password: '',
                }}
                validationSchema={loginSchema}
                onSubmit={values => loginClicked(values)}
            >
                {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
                    <Layout style={styles.inputsContainer}>
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
                            <Button onPress={() => handleSubmit()} style={styles.button} disabled={loading}>Login</Button>
                        </Layout>
                    </Layout>
                )}
            </Formik>
        </Container>
    );
};

export default Login;

const styles = StyleSheet.create({
    inputsContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
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
        // alignSelf: "flex-end",
    },
    buttonContainer: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    }
});
