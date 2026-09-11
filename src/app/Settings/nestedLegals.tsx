import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../themeContext";

export default function NestedLegals() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background, paddingTop: insets.top },
      ]}
    >
      <View style={styles.navbarContainer}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
          <Text style={[styles.backButtonText, { color: theme.text }]}>
            Settings
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.segmentedControl,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("privacy")}
            style={[
              styles.segmentButton,
              activeTab === "privacy" && [
                styles.segmentActive,
                { backgroundColor: theme.background },
              ],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: theme.mutedText },
                activeTab === "privacy" && [
                  styles.segmentActiveText,
                  { color: theme.text },
                ],
              ]}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab("terms")}
            style={[
              styles.segmentButton,
              activeTab === "terms" && [
                styles.segmentActive,
                { backgroundColor: theme.background },
              ],
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: theme.mutedText },
                activeTab === "terms" && [
                  styles.segmentActiveText,
                  { color: theme.text },
                ],
              ]}
            >
              Terms of Use
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "privacy" ? (
          <PrivacyPolicyContent theme={theme} />
        ) : (
          <TermsOfUseContent theme={theme} />
        )}
      </ScrollView>
    </View>
  );
}

function PrivacyPolicyContent({ theme }: { theme: any }) {
  return (
    <View style={styles.textContainer}>
      <Text style={[styles.title, { color: theme.text }]}>
        Privacy Policy — Actv
      </Text>
      <Text style={[styles.dateText, { color: theme.mutedText }]}>
        Last updated: September 10, 2026
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        This Privacy Policy describes how the{" "}
        <Text style={styles.bold}>Actv</Text> application ("the Application"),
        developed by <Text style={styles.bold}>RedLabs</Text>, processes user
        information ("you", "the User").
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>1. Summary</Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • Actv <Text style={styles.bold}>does not collect user accounts</Text>{" "}
        (no sign-up, no email required).
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • Your activity data is stored{" "}
        <Text style={styles.bold}>locally on your device</Text> (SQLite database
        and local storage), and not on any Publisher server.
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • The Application accesses your{" "}
        <Text style={styles.bold}>location</Text> solely to record and display
        your activities on a map.
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • No personal data is sold or shared for advertising purposes.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>2. Data Collected</Text>
      <Text style={[styles.h3, { color: theme.text }]}>2.1 Location Data</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application requests access to your precise and/or approximate
        location (<Text style={styles.code}>ACCESS_FINE_LOCATION</Text>,{" "}
        <Text style={styles.code}>ACCESS_COARSE_LOCATION</Text>) in order to:
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • Record the route or area of your activities;
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • Display these activities on an integrated map.
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        This data is processed <Text style={styles.bold}>locally</Text> on your
        device and stored in the local database (SQLite). It is not transmitted
        to our servers.
      </Text>

      <Text style={[styles.h3, { color: theme.text }]}>
        2.2 Locally Stored Data
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The activities, history, and preferences you create are saved in your
        device's local storage. This data remains on your device, is deleted if
        you uninstall the Application, and is not backed up on a remote server.
      </Text>

      <Text style={[styles.h3, { color: theme.text }]}>
        2.3 Data Transmitted to Third Parties (Mapping)
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        To display maps, the Application uses third-party services (Mapbox
        and/or MapLibre). In this context, your location may be transmitted to
        this provider to render the map display.
      </Text>

      <Text style={[styles.h3, { color: theme.text }]}>
        2.4 Data We Do Not Collect
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        We do not collect your name, email, contacts, photos, or advertising
        identifiers.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        3. Purpose of Processing
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        Location and activity data are used exclusively to provide the primary
        functionality of the Application and to improve the user experience.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        4. Legal Basis (GDPR)
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        For users in the EU, location processing is based on your consent via
        iOS/Android permissions. You can withdraw it at any time.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>5. Data Sharing</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        We do not sell, rent, or share your personal data with third parties for
        commercial or advertising purposes.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>6. Data Retention</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        Since data is stored locally, it is retained for as long as the
        Application remains installed.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>7. Security</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        We implement reasonable measures permitted by the operating system to
        protect your data against unauthorized access.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>8. User Rights</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        You have rights of access, rectification, erasure, and data portability,
        which can be exercised by deleting the data or uninstalling the
        Application.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>9. Minors</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application is not specifically intended for children under 13 years
        of age.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        10. Changes to This Policy
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        This policy may be updated periodically. The date of the last update is
        listed at the top of the document.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>11. Contact</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        For any questions regarding your data:{" "}
        <Text style={{ fontWeight: "600" }}>
          contactpro.feedback.zakariaham@gmail.com
        </Text>
      </Text>
    </View>
  );
}

function TermsOfUseContent({ theme }: { theme: any }) {
  return (
    <View style={styles.textContainer}>
      <Text style={[styles.title, { color: theme.text }]}>
        Terms of Use — Actv
      </Text>
      <Text style={[styles.dateText, { color: theme.mutedText }]}>
        Last updated: September 10, 2026
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        These Terms of Use ("TOU") govern access to and use of the{" "}
        <Text style={styles.bold}>Actv</Text> mobile application (hereinafter
        "the Application"). By downloading, installing, or using the
        Application, the user accepts these Terms of Use without reservation.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>1. Purpose</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        If the User does not accept these terms, they must refrain from using
        the Application.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        2. Description of Service
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        Actv is an activity tracking application that allows the User to:
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • Record and view geolocated activities on a map;
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • View an activity history via an integrated calendar;
      </Text>
      <Text style={[styles.bullet, { color: theme.text }]}>
        • Store this data locally on their device.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        3. Access to the Application
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application is available on iOS and Android. The Publisher does not
        guarantee that the Application is compatible with all devices or that it
        will be free of bugs.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        4. Account and Minimum Age
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application does not require a user account. The User guarantees
        that they have the legal capacity required to accept these Terms of Use.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        5. Requested Permissions
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application requests access to location (precise and approximate),
        used exclusively to record and display activities.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        6. Intellectual Property
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application, its source code, design, and logo are the exclusive
        property of the Publisher. Data created by the User remains their
        property.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>7. Authorized Use</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The User agrees not to decompile the Application, not to use it for
        unlawful purposes, and not to impair its proper functioning.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        8. Limitation of Liability
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Application is provided "as is". The Publisher cannot be held liable
        for the loss of data stored locally on the device.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>9. Personal Data</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The processing of personal data is described in the Privacy Policy.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        10. Changes to Terms of Use
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The Publisher reserves the right to modify these Terms of Use at any
        time.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>11. Termination</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        The User may stop using the Application at any time by uninstalling it.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>
        12. Governing Law and Disputes
      </Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        These Terms of Use are governed by applicable law. Any dispute falls
        under the jurisdiction of the competent courts.
      </Text>

      <Text style={[styles.h2, { color: theme.text }]}>13. Contact</Text>
      <Text style={[styles.paragraph, { color: theme.text }]}>
        For any questions:{" "}
        <Text style={{ fontWeight: "600" }}>
          contactpro.feedback.zakariaham@gmail.com
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbarContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 2,
  },
  segmentedControl: {
    flexDirection: "row",
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  segmentActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: "600",
  },
  segmentActiveText: {
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },
  dateText: {
    fontSize: 13,
    marginBottom: 12,
  },
  h2: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 4,
  },
  h3: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  bullet: {
    fontSize: 14,
    lineHeight: 22,
    paddingLeft: 8,
  },
  bold: {
    fontWeight: "700",
  },
  code: {
    fontFamily: "monospace",
    fontSize: 13,
  },
});