"use client";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Font,
  Svg,
  Path,
  Rect,
  Circle,
  Polyline,
} from "@react-pdf/renderer";
import { ResumeData } from "@/types/resume";

// Register fonts (using standard fonts for now to ensure compatibility)
Font.register({
  family: "Roboto",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
});
Font.register({
  family: "Roboto-Bold",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
});

Font.register({
  family: "Roboto-BoldOblique",
  src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bolditalic-webfont.ttf",
});
const styles = StyleSheet.create({
  page: {
    padding: "0.5in",
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    lineHeight: 1.15,
    color: "#000000",
  },
  // Header
  headerContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    fontSize: 10,
  },
  achievementsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#000000",
  },
  projectLink: {
    textDecoration: "underline",
    color: "#000000",
  },
  // Generic Section
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    marginBottom: 6,
    paddingBottom: 2,
  },
  // Item Rows
  entryContainer: {
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  skillsHeader: {
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  entryTitle: {
    fontSize: 11,
    fontFamily: "Times-Bold",
  },
  entrySubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  achievementsLabel: {
    fontFamily: "Times-Bold",
  },
  entrySubtitle: {
    fontSize: 10,
    fontFamily: "Times-Italic",
  },
  entryDate: {
    fontSize: 10,
    fontFamily: "Times-Italic",
    textAlign: "right",
  },
  // Bullets
  bulletList: {
    marginTop: 2,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 8,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    lineHeight: 1,
  },
  bulletContent: {
    flex: 1,
    fontSize: 10,
  },
  // Skills
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  skillLabel: {
    fontFamily: "Times-Bold",
    marginRight: 4,
  },
  skillValue: {
    flex: 1,
    fontFamily: "Times-Roman",
  },
});

interface ResumePDFProps {
  data: ResumeData ;
}

const Separator = () => <Text style={{ marginHorizontal: 2 }}>|</Text>;

export const ResumePDF = ({ data }: ResumePDFProps) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>{data.personalInfo.fullName}</Text>
          <View style={styles.contactRow}>
            <Svg viewBox="0 0 24 24" width="10" height="10">
              <Path
                d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <Rect
                x="2"
                y="4"
                width="20"
                height="16"
                rx="2"
                stroke="black"
                strokeWidth="2"
                fill="none"
              />
            </Svg>
            <Text style={{ marginLeft: 3 }}>{data.personalInfo.email}</Text>
            {data.personalInfo.phone && (
              <>
                <Separator />
                <Svg viewBox="0 0 24 24" width="10" height="10">
                  <Path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
                <Text style={{ marginLeft: 3 }}>{data.personalInfo.phone}</Text>
              </>
            )}
            {data.personalInfo.linkedin && (
              <>
                <Separator />
                <Svg viewBox="0 0 24 24" width="10" height="10">
                  <Path
                    d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Rect
                    x="2"
                    y="9"
                    width="4"
                    height="12"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Circle
                    cx="4"
                    cy="4"
                    r="2"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
                <Link
                  src={`https://www.linkedin.com/in/${data.personalInfo.linkedin}`}
                  style={{ ...styles.link, marginLeft: 3 }}
                >
                  {data.personalInfo.linkedin.replace(/^https?:\/\//, "")}
                </Link>
              </>
            )}
            {data.personalInfo.website && (
              <>
                <Separator />
                <Svg viewBox="0 0 24 24" width="10" height="10">
                  <Circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <Path
                    d="M2 12h20"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
                <Link
                  src={`https://${data.personalInfo.website}`}
                  style={{ ...styles.link, marginLeft: 3 }}
                >
                  {data.personalInfo.website.replace(/^https?:\/\//, "")}
                </Link>
              </>
            )}
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <Text style={{ fontSize: 10, marginBottom: 6 }}>{data.summary}</Text>
        </View>

        {/* EDUCATION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu) => (
            <View key={edu.id} style={styles.entryContainer}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{edu.school}</Text>
                <Text style={styles.entryDate}>
                  {edu.endDate}
                </Text>
              </View>
              <View style={styles.entrySubRow}>
                <Text style={styles.entrySubtitle}>
                  {edu.degree} in {edu.field}
                </Text>
                <Text style={styles.entrySubtitle}>GPA: {edu.grade}</Text>
              </View>
              {edu.achievements && edu.achievements.length > 0 && (
                <Text style={{ fontSize: 10, marginTop: 2 }}>
                  <Text style={styles.achievementsLabel}>Achievements: </Text>
                  {edu.achievements}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* EXPERIENCE */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={styles.entryContainer}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryTitle}>{exp.company}</Text>
                <Text style={styles.entryDate}>
                  {exp.startDate} – {exp.endDate}
                </Text>
              </View>
              <View style={styles.entryHeader}>
                <Text style={styles.entrySubtitle}>{exp.position}</Text>
                <Text style={styles.entrySubtitle}>{exp.location}</Text>
              </View>
              <View style={styles.bulletList}>
                {exp.highlights.map((highlight, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletContent}>{highlight}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* PROJECTS */}
        {data.projects && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((proj) => (
              <View key={proj.id} style={styles.entryContainer}>
                <View style={styles.skillsHeader}>
                  <Text style={styles.entryTitle}>{proj.name}</Text>
                  {proj.link && (
                    <Text>{" "}|{" "}
                    <Link src={`https://${proj.link}`} style={styles.projectLink}>
                       Link
                    </Link></Text>
                  )}
                </View>
                <View style={styles.bulletList}>
                  {proj.highlights.map((highlight, i) => (
                    <View key={i} style={styles.bulletRow}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletContent}>{highlight}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* SKILLS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {data.skills.map((skill, i) => (
            <Text key={i} style={{ fontSize: 10 }}>
              <Text style={styles.skillLabel}>{skill.category}: </Text>
              {skill.items.join(", ")}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};
