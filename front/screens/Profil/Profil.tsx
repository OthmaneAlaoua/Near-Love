import React, {useEffect, useState} from 'react';
import Container from "../../components/Container/Container";
import {Button, Card, Datepicker, Divider, Icon, IndexPath, Input, Layout, Modal, Select, SelectItem, Spinner, Text} from "@ui-kitten/components";
import {NavigationProp} from "@react-navigation/native";
import store from "../../store/store";
import {getToken, logout} from "../../store/slices/user";
import {Platform, ScrollView, StyleSheet} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import ImageItem from "../../components/ImageItem/ImageItem";
import request from "../../services/request";
import {Formik} from "formik";
import * as Yup from "yup";
import Toast from "react-native-toast-message";
import config, {createUrl} from '../../config';
import {useSelector} from "react-redux";

interface IProps {
    navigation: NavigationProp<any>
}

interface IForm {
    pseudo: string,
    dateOfBirth: any,
    gender: any,
    preferredGender: any[],
}

const gender = ['Female', 'Male'];

let initialState: IForm = {
    pseudo: '',
    dateOfBirth: undefined,
    gender: new IndexPath(0),
    preferredGender: [],
};

const Profil = ({navigation}: IProps) => {
    const now = new Date();
    const [loading, setLoading] = useState(true);
    const [loadingSaveProfile, setLoadingSaveProfile] = useState(false);
    const [loadingDeleteImage, setLoadingDeleteImage] = useState(false);
    const [loadingUpload, setLoadingUpload] = useState(false);
    const [images, setImages] = useState<any[]>([]);
    const [savedImages, setSavedImages] = useState<any[]>([]);
    const [data, setData] = useState(initialState);
    const [deleteImageId, setDeleteImageId] = useState<number | undefined>(undefined);

    const token = useSelector(getToken);

    useEffect(() => {
        request('information', 'customer', 'get')
            .then(res => {
                const {images, data: {attracted_by, date_of_birth, gender, pseudo}} = res?.data?.data?.user;
                setData({
                    pseudo,
                    dateOfBirth: new Date(date_of_birth * 1000),
                    gender: new IndexPath(gender),
                    preferredGender: attracted_by === 2 ? [new IndexPath(0), new IndexPath(1)] : [new IndexPath(attracted_by)],
                });
                setSavedImages(images);
            }).catch(err => {
            console.log(err?.response)
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const profilSchema = Yup.object().shape({
        pseudo: Yup.string().min(3, 'Too short!').max(64, 'Too long!').required('Required'),
        dateOfBirth: Yup.date().required('Required'),
        gender: Yup.object().required('Required'),
        preferredGender: Yup.array().min(1, 'Required').required('Required'),
    });

    const logoutClicked = () => {
        store.dispatch(logout());
        navigation.navigate('Authentication');
    }

    /**
     * add images
     */
    const pickImageGallery = async () => {
        if (loadingUpload) return;
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'We need your permission to access the gallery'
            });
            return;
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            // allowsMultipleSelection: true,
            quality: 1,
            base64: true,
        });

        if (!result.cancelled) {
            setImages(prev => [...prev, result]);
        }
    };

    const pickImageCamera = async () => {
        if (loadingUpload) return;
        const {status} = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Toast.show({
                type: 'error',
                text1: 'We need your permission to access the camera'
            });
            return;
        }
        let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
            base64: true,
        });

        if (!result.cancelled) {
            setImages(prev => [...prev, result]);
        }
    };

    const deleteImage = (index: number) => {
        setImages(prev => {
            const newData = [...prev];
            newData.splice(index, 1)
            return newData;
        });
    }

    /**
     * profil
     * @param values
     */
    const saveProfil = async (values: IForm) => {
        const {pseudo, gender, preferredGender, dateOfBirth} = values;
        try {
            setLoadingSaveProfile(true);
            const formattedDateOfBirth = [
                dateOfBirth.getDate() < 10 ? `0${dateOfBirth.getDate()}` : dateOfBirth.getDate(),
                dateOfBirth.getMonth() + 1 < 10 ? `0${dateOfBirth.getMonth() + 1}` : dateOfBirth.getMonth() + 1,
                dateOfBirth.getFullYear()
            ].join('-');

            const body = {
                gender: gender.row,
                attracted_by: preferredGender.length > 1 ? 2 : preferredGender[0].row,
                age: 23,
                dateOfBirth: formattedDateOfBirth
            };
            if (pseudo != data.pseudo) {
                // @ts-ignore
                body.pseudo = pseudo;
            }

            const response = await request('information', 'customer', 'post', body);
            if (response) {
                const {data: {attracted_by, date_of_birth, gender, pseudo}} = response?.data?.data;
                setData({
                    pseudo,
                    dateOfBirth: new Date(date_of_birth * 1000),
                    gender: new IndexPath(gender),
                    preferredGender: attracted_by === 2 ? [new IndexPath(0), new IndexPath(1)] : [new IndexPath(attracted_by)],
                });
            }
            Toast.show({
                type: 'success',
                text1: 'Profile edited'
            });
        } catch (e) {
            console.log(e?.response);
            Toast.show({
                type: 'error',
                text1: 'Edit profile error'
            });
        } finally {
            setLoadingSaveProfile(false);
        }
    }

    /**
     * save new images
     */
    const saveImages = async () => {
        try {
            setLoadingUpload(true);
            const formData = new FormData();
            images.forEach(e => {
                const name = e.uri.split('/').pop();
                let match = /\.(\w+)$/.exec(name);
                let type = match ? `image/${match[1]}` : `image`;
                const image = {
                    name,
                    type,
                    uri: Platform.OS === "android" ? e.uri : e.uri.replace("file://", "")
                };
                // @ts-ignore
                formData.append('images[]', image);
            });

            const response = await request('images', 'customer', 'post', formData, true, {'Content-Type': 'multipart/form-data'});
            setSavedImages(response?.data?.data);
            setImages([]);
            Toast.show({
                type: 'success',
                text1: 'Upload complete'
            });
        } catch (e) {
            console.log(e?.response);
            Toast.show({
                type: 'error',
                text1: 'Upload error'
            });
        } finally {
            setLoadingUpload(false);
        }
    }

    const deleteSavedImage = async () => {
        try {
            setLoadingDeleteImage(true);
            await request(['images', deleteImageId + ''], 'customer', 'delete');
            Toast.show({
                type: 'success',
                text1: 'Image deleted'
            });
            const deletedIndex = savedImages.findIndex(e => e.id === deleteImageId);
            setSavedImages(prev => {
                const current = [...prev];
                current.splice(deletedIndex, 1);
                return current;
            })
        } catch (e) {
            Toast.show({
                type: 'error',
                text1: 'Error deleting image'
            });
        } finally {
            setLoadingDeleteImage(false);
            setDeleteImageId(undefined);
        }
    }

    return (
        <Container scroll={true} loading={loading}>
            <Button onPress={() => logoutClicked()} appearance="ghost" status="danger">Logout</Button>
            <Divider style={styles.otherDivider}/>
            <Formik
                enableReinitialize
                initialValues={data}
                validationSchema={profilSchema}
                onSubmit={values => saveProfil(values)}
            >
                {({handleChange, setFieldValue, handleBlur, handleSubmit, values, errors, touched}) => (
                    <>
                        <Input
                            placeholder="Pseudo"
                            label="Pseudo"
                            value={values.pseudo}
                            onChangeText={handleChange('pseudo')}
                            style={styles.input}
                            status={errors.pseudo && touched.pseudo ? 'danger' : undefined}
                        />
                        <Text style={styles.error}>{errors.pseudo && touched.pseudo ? errors.pseudo : ''}</Text>

                        <Select
                            placeholder="Gender"
                            label="Gender"
                            value={gender[values.gender.row]}
                            selectedIndex={values.gender}
                            onSelect={(index) => setFieldValue('gender', index)}
                            style={styles.select}
                            status={errors.gender && touched.gender ? 'danger' : undefined}
                        >
                            <SelectItem title="Female"/>
                            <SelectItem title="Male"/>
                        </Select>
                        <Text style={styles.error}>{errors.gender && touched.gender ? 'Required' : ''}</Text>

                        <Datepicker
                            placeholder="Date of birth"
                            label="Date of birth"
                            min={new Date(now.getFullYear() - 100, now.getMonth() - 1, now.getDay())}
                            max={new Date(now.getFullYear() - 18, now.getMonth() - 1, now.getDay())}
                            date={values.dateOfBirth}
                            onSelect={(value) => setFieldValue('dateOfBirth', value)}
                            style={styles.select}
                            status={errors.dateOfBirth && touched.dateOfBirth ? 'danger' : undefined}
                        />
                        <Text style={styles.error}>{errors.dateOfBirth && touched.dateOfBirth ? 'Required' : ''}</Text>

                        <Divider style={styles.divider}/>
                        <Select
                            placeholder="Preferred Gender"
                            label="Preferred Gender"
                            multiSelect={true}
                            value={values.preferredGender.map((e: any) => gender[e.row]).join(', ')}
                            selectedIndex={values.preferredGender}
                            onSelect={(index) => setFieldValue('preferredGender', index)}
                            style={styles.select}
                            status={errors.preferredGender && touched.preferredGender ? 'danger' : undefined}
                        >
                            <SelectItem title="Female"/>
                            <SelectItem title="Male"/>
                        </Select>
                        <Text style={styles.error}>{errors.preferredGender && touched.preferredGender ? 'Required' : ''}</Text>

                        <Button onPress={() => handleSubmit()} style={styles.button} disabled={loadingSaveProfile} accessoryLeft={() => loadingSaveProfile ? <Spinner size="tiny"/> : <></>}>Save Profil</Button>

                        <Text category="label" appearance="hint">Add Images</Text>
                        <ScrollView horizontal={true} contentContainerStyle={styles.imagesContainer} style={styles.images}>
                            <Button
                                onPress={() => pickImageCamera()}
                                style={styles.imageButton}
                                appearance="outline"
                                status="warning"
                                accessoryRight={(props) => (
                                    <Icon {...props} name='camera-outline'/>
                                )}
                            />
                            <Button
                                onPress={() => pickImageGallery()}
                                style={styles.imageButton}
                                appearance="outline"
                                accessoryRight={(props) => (
                                    <Icon {...props} name='image-outline'/>
                                )}
                            />
                            {images.map((e, index) => <ImageItem source={{uri: e.uri}} onDeleteClick={() => deleteImage(index)} key={index}/>)}
                        </ScrollView>
                        <Button
                            onPress={() => saveImages()}
                            style={styles.button}
                            appearance="ghost"
                            disabled={images?.length < 1 || loadingUpload}
                            accessoryLeft={() => loadingUpload ? <Spinner size="tiny"/> : <></>}
                        >Upload</Button>

                        {savedImages?.length > 0 && <>
                            <Text category="label" appearance="hint">Edit already saved images</Text>
                            <ScrollView horizontal={true} contentContainerStyle={styles.imagesContainer} style={styles.images}>
                                {savedImages.map((e, index) => <ImageItem
                                    imagePath={e.id + ''}
                                    onDeleteClick={() => setDeleteImageId(e.id)}
                                    key={index}
                                    withLoading={true}
                                />)}
                            </ScrollView>
                            <Modal
                                visible={deleteImageId != null}
                                backdropStyle={styles.backdrop}
                                onBackdropPress={() => {
                                    if (!loadingDeleteImage) setDeleteImageId(undefined);
                                }}>
                                <Card disabled={true}>
                                    <Text>Proceed to delete the image ?</Text>
                                    <Layout style={styles.buttonFlexContainer}>
                                        <Button
                                            style={styles.modalButton}
                                            onPress={() => deleteSavedImage()}
                                            status="danger"
                                            disabled={loadingDeleteImage}
                                            accessoryRight={() => loadingDeleteImage ? <Spinner size="tiny"/> : <></>}
                                        >Yes</Button>
                                        <Button
                                            style={styles.modalButton}
                                            onPress={() => setDeleteImageId(undefined)}
                                            appearance="ghost"
                                            disabled={loadingDeleteImage}
                                        >Dismiss</Button>
                                    </Layout>
                                </Card>
                            </Modal>
                        </>}
                    </>
                )}
            </Formik>
        </Container>
    );
};

export default Profil;

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
    otherDivider: {
        marginTop: 16,
        marginBottom: 8,
    },
    divider: {
        marginVertical: 4,
    },
    imagesContainer: {
        flexDirection: "row",
    },
    images: {
        flexGrow: 0,
        flexShrink: 0,
        padding: 0,
        marginVertical: 4,
        paddingVertical: 4,
    },
    imageButton: {
        marginRight: 8,
        height: 84,
        width: 84
    },
    buttonContainer: {
        width: '100%',
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    buttonFlexContainer: {
        marginTop: 16,
        flexDirection: "row",
    },
    modalButton: {
        flex: 1,
    }
});
