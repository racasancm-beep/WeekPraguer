import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
    },
    section: {
        margin: 10,
        padding: 10,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    subHeader: {
        fontSize: 14,
        marginTop: 15,
        marginBottom: 5,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    text: {
        fontSize: 12,
        marginTop: 5,
        lineHeight: 1.5,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        width: 100,
    },
    value: {
        fontSize: 12,
        flex: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 10,
        color: 'grey',
    }
});

interface ContractProps {
    bookingId: string;
    date: string;
    ownerName: string;
    renterName: string;
    spaceName: string;
    spaceAddress: string;
    startTime: string;
    endTime: string;
    totalPrice: number;
    termsAcceptedAt: string;
}

export const ContractDocument = ({
    bookingId, date, ownerName, renterName, spaceName, spaceAddress, startTime, endTime, totalPrice, termsAcceptedAt
}: ContractProps) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.section}>
                <Text style={styles.header}>WEEKEND SPACE RENTAL AGREEMENT</Text>
                <Text style={{ fontSize: 10, textAlign: 'center', marginBottom: 20 }}>Contract ID: {bookingId}</Text>

                <Text style={styles.text}>Date of Agreement: {date}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>1. PARTIES</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Landlord:</Text>
                    <Text style={styles.value}>{ownerName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Tenant:</Text>
                    <Text style={styles.value}>{renterName}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>2. PREMISES</Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Space:</Text>
                    <Text style={styles.value}>{spaceName}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{spaceAddress}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>3. TERMS & CONDITIONS</Text>
                <Text style={styles.text}>
                    The Landlord agrees to rent the Premises to the Tenant for the following period:
                </Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Start:</Text>
                    <Text style={styles.value}>{startTime}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>End:</Text>
                    <Text style={styles.value}>{endTime}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Total Fee:</Text>
                    <Text style={styles.value}>{totalPrice} RON</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>4. USAGE & RULES</Text>
                <Text style={styles.text}>
                    1. The Tenant shall use the Premises solely for professional office work or approved events.{"\n"}
                    2. Quiet hours must be observed between 22:00 and 08:00 if applicable.{"\n"}
                    3. The Tenant is liable for any damage to the property or effective equipment.{"\n"}
                    4. This booking is valid only for the dates and times specified above (Weekend Access).
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.subHeader}>5. DIGITAL ACCEPTANCE</Text>
                <Text style={styles.text}>
                    This agreement was digitally accepted by the Tenant on the MyGenie platform.
                </Text>
                <View style={styles.row}>
                    <Text style={styles.label}>Accepted At:</Text>
                    <Text style={styles.value}>{termsAcceptedAt}</Text>
                </View>
            </View>

            <Text style={styles.footer}>
                Generated by MyGenie | {new Date().getFullYear()}
            </Text>
        </Page>
    </Document>
);
