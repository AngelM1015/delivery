import React, { useState, useEffect } from 'react';
import { Text, ScrollView, StyleSheet, View, Dimensions } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const colorPalette = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
    "#9966FF", "#FF9F40", "#FFCD56", "#4BC0C2",
    "#C9CBFF", "#FF6386"
  ];
  

const DashboardScreen = () => {
    const [role, setRole] = useState(null);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoleAndData = async () => {
            try {
                const storedRole = await AsyncStorage.getItem('userRole');
                setRole(storedRole);
                await fetchData(storedRole);
            } catch (error) {
                console.error('Error initializing dashboard:', error);
            }
        };

        const fetchData = async (role) => {
            try {
                const endpoint = role === 'partner' ? 'peak_business_hours' : 'menu_item_performance';
                const response = await axios.get(`http://localhost:3000/api/v1/${endpoint}`);
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoleAndData();
    }, []);

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        propsForLabels: {
            fontSize: "12"
        }
    };

    const screenWidth = Dimensions.get("window").width;
    const chartHeight = 250; // Increased height for better readability

    const renderDashboard = () => {
        if (loading) {
            return <Text>Loading...</Text>;
        }

        if (role === 'partner') {
            return (
                <BarChart
                    data={{
                        labels: Object.keys(data.peak_hours),
                        datasets: [{ data: Object.values(data.peak_hours) }]
                    }}
                    width={screenWidth}
                    height={chartHeight}
                    chartConfig={chartConfig}
                    verticalLabelRotation={30} // Rotate labels to avoid squishing
                    style={styles.chartContainer}
                />
            );
        } else if (role === 'restaurant_owner') {
            return (
                <PieChart
                data={data.performance_data.map((item, index) => ({
                    name: item.name,
                    population: item.total_quantity,
                    color: colorPalette[index % colorPalette.length],
                    legendFontColor: '#7F7F7F',
                    legendFontSize: 15,
                }))}
                width={screenWidth}
                height={chartHeight}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                style={styles.chartContainer}
            />
            );
        } else if (role === 'admin') {
            return <Text>Hi Admin</Text>;
        } else {
            return <Text>Role-specific data not available.</Text>;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Dashboard</Text>
            {renderDashboard()}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    chartContainer: {
        alignItems: 'center',
        marginBottom: 20,
        borderRadius: 8,
    },
});

export default DashboardScreen;
