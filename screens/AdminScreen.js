import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";
import { BarChart, PieChart, LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const AdminScreen = () => {
  const restaurantData = [
    { name: "Restaurant A", ordersCount: 150 },
    { name: "Restaurant B", ordersCount: 100 },
    { name: "Restaurant C", ordersCount: 60 },
  ];

  const orderStats = [
    {
      name: "Completed",
      count: 200,
      color: "green",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Pending",
      count: 50,
      color: "yellow",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
    {
      name: "Cancelled",
      count: 30,
      color: "red",
      legendFontColor: "#7F7F7F",
      legendFontSize: 15,
    },
  ];

  const revenueData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        data: [30000, 45000, 28000, 50000, 60000],
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#ffa726",
    },
  };

  const restaurantChartData = {
    labels: restaurantData.map((item) => item.name),
    datasets: [
      {
        data: restaurantData.map((item) => item.ordersCount),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Restaurant Orders</Text>
        <BarChart
          data={restaurantChartData}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Order Stats</Text>
        <PieChart
          data={orderStats}
          width={screenWidth - 30}
          height={220}
          chartConfig={chartConfig}
          accessor={"count"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Revenue</Text>
        <LineChart
          data={revenueData}
          width={screenWidth - 30}
          height={256}
          chartConfig={chartConfig}
          bezier
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 10,
    marginHorizontal: 15,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
});

export default AdminScreen;
