import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';



//interface for summary data, accepts any type of data
interface SummaryPDFProps {
  data: any;
  reportData?: any;
}

// PDF styles for exported report
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#303D23',
    marginBottom: 10,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 30,
    textAlign: 'left',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#303D23',
    marginBottom: 15,
    borderBottom: '2px solid #365B5E',
    paddingBottom: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  metricBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    border: '1px solid #D1D5DB',
  },
  metricLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  insightItem: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderLeft: '4px solid #365B5E',
    border: '1px solid #E5E7EB',
  },
  insightText: {
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 9,
    color: '#9CA3AF',
  },
});

const SummaryPDF: React.FC<SummaryPDFProps> = ({ data, reportData }) => {
  // gets insight list items and then returns array of insight strings
  function getInsightList(sectionName: string) {
    if (!data || !data.insights || !data.insights[sectionName]) {
      return [];
    }

    // gets insight objects
    const sectionInsights = data.insights[sectionName];

    // all three insights collected into one array
    const insight1 = sectionInsights.insight1;
    const insight2 = sectionInsights.insight2;
    const insight3 = sectionInsights.insight3;
    const allThreeInsights = [insight1, insight2, insight3];

    // removes empty insights if any exist
    const onlyValidInsights = allThreeInsights.filter(Boolean);

    return onlyValidInsights;
  }

  // Helper function to get category data (same as summary page)
  function getCategoryData(section: string, title: string, key: string) {
    if (!data || !data[section]) return null;

    const category = data[section].find((cat: any) => cat.title === title);
    return category ? category[key] : null;
  }

  // Fallback function to extract insights from any data structure
  function extractInsightsFallback(sectionName: string) {
    // Try different possible data structures
    if (data?.insights?.[sectionName]) {
      const section = data.insights[sectionName];
      return [section.insight1, section.insight2, section.insight3].filter(Boolean);
    }
    
    // Try if insights is an array
    if (Array.isArray(data?.insights)) {
      const section = data.insights.find((item: any) => item.title === sectionName);
      if (section) {
        return [section.insight1, section.insight2, section.insight3].filter(Boolean);
      }
    }
    
    // Try direct properties
    if (data?.[sectionName]) {
      const section = data[sectionName];
      return [section.insight1, section.insight2, section.insight3].filter(Boolean);
    }
    
    return [];
  }

  // Fallback function to get metric values
  function getMetricValueFallback(metricTitle: string) {
    // Try categories array
    if (data?.categories) {
      const category = data.categories.find((cat: any) => cat.title === metricTitle);
      if (category?.metric) {
        return category.metric;
      }
    }
    
    // Try direct properties
    if (data?.[metricTitle]) {
      return data[metricTitle];
    }
    
    // Try lowercase
    const lowerTitle = metricTitle.toLowerCase().replace(/\s+/g, '');
    if (data?.[lowerTitle]) {
      return data[lowerTitle];
    }
    
    return 'N/A';
  }


  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>CODi Retrospective Analysis</Text>
        <Text style={styles.subtitle}>
          Report: {reportData?.name || 'Marketing Analysis'} • Generated: {new Date().toLocaleDateString()}
        </Text>

        {/* Key Metrics Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Sessions</Text>
              <Text style={styles.metricValue}>{getMetricValueFallback('Total Sessions')}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Total Revenue</Text>
              <Text style={styles.metricValue}>{getMetricValueFallback('Total Revenue')}</Text>
            </View>
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Conversion Rate</Text>
              <Text style={styles.metricValue}>{getMetricValueFallback('Conversion Rate')}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Bounce Rate</Text>
              <Text style={styles.metricValue}>{getMetricValueFallback('Bounce Rate')}</Text>
            </View>
          </View>
        </View>

        {/* Observations Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observations</Text>
          {extractInsightsFallback('Observations').map((insightText, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightText}>• {insightText}</Text>
            </View>
          ))}
        </View>

        {/* Key Insights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {extractInsightsFallback('Key Insights').map((insightText, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightText}>• {insightText}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated by CODi AI • {new Date().toLocaleDateString()}
        </Text>
      </Page>

      {/* Actionable Items Section - Page 2 */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Actionable Recommendations</Text>
        <Text style={styles.subtitle}>
          Report: {reportData?.name || 'Marketing Analysis'} • Generated: {new Date().toLocaleDateString()}
        </Text>
        
        {/* Actionable Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actionable Items</Text>
          {extractInsightsFallback('Actionable Items').map((insightText, index) => (
            <View key={index} style={styles.insightItem}>
              <Text style={styles.insightText}>• {insightText}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Generated by CODi AI • {new Date().toLocaleDateString()}
        </Text>
      </Page>
    </Document>
  );
};

export default SummaryPDF;
