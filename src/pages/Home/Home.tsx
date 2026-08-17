import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { TranslationKey } from "../../../constants/i18n";
import { useSettings } from "../../../context/SettingsContext";
import type { Contact } from "../../data/contacts";
import { mockGroups } from "../../data/groups";
import { mockLocations } from "../../data/locations";
import { Dropdown } from "../../components/common";

function formatElapsedTime(
  totalSeconds: number,
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string,
) {
  if (totalSeconds < 60) {
    return `${totalSeconds} ${totalSeconds === 1 ? t("second") : t("seconds")}`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minuteLabel = `${minutes} ${minutes === 1 ? t("minute") : t("minutes")}`;

  if (seconds === 0) {
    return minuteLabel;
  }

  return `${minuteLabel} ${seconds} ${seconds === 1 ? t("second") : t("seconds")}`;
}

function contactDisplayName(contact: Contact) {
  if (contact.nickname) {
    return `${contact.firstName} "${contact.nickname}" ${contact.lastName}`;
  }

  return `${contact.firstName} ${contact.lastName}`;
}

export default function HomeScreen() {
  const { colors, t } = useSettings();
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [openDropdown, setOpenDropdown] = useState<"group" | "location" | null>(
    null,
  );
  const [signalActive, setSignalActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);

  const groupOptions = useMemo(
    () => mockGroups.map((group) => ({ value: group.id, label: group.name })),
    [],
  );

  const locationOptions = useMemo(
    () =>
      mockLocations.map((location) => ({
        value: location.id,
        label: location.name,
      })),
    [],
  );

  const selectedGroup = mockGroups.find(
    (group) => group.id === selectedGroupId,
  );
  const selectedLocation = mockLocations.find(
    (location) => location.id === selectedLocationId,
  );

  useEffect(() => {
    if (!signalActive) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [signalActive]);

  function activateSignal() {
    if (signalActive) {
      return;
    }

    console.log("Bar Signal Activated");
    setOpenDropdown(null);
    setElapsedSeconds(0);
    setSignalActive(true);
  }

  function requestCancelSignal() {
    setConfirmCancelVisible(true);
  }

  function dismissCancelConfirmation() {
    setConfirmCancelVisible(false);
  }

  function confirmCancelSignal() {
    setConfirmCancelVisible(false);
    setSignalActive(false);
    setElapsedSeconds(0);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.welcome, { color: colors.accentMuted }]}>
        {t("welcomeTo")}
      </Text>
      <Text style={[styles.title, { color: colors.accent }]}>
        {t("appName")}
      </Text>

      {signalActive ? (
        <View style={styles.activeSignal}>
          <View style={styles.timerBlock}>
            {selectedGroup && selectedLocation ? (
              <Text style={[styles.headingTo, { color: colors.accentMuted }]}>
                {t("headingTo", {
                  group: selectedGroup.name,
                  location: selectedLocation.name,
                })}
              </Text>
            ) : null}
            <Text style={[styles.timerLabel, { color: colors.accentMuted }]}>
              {t("travelTimer")}
            </Text>
            <Text style={[styles.timerValue, { color: colors.accent }]}>
              {formatElapsedTime(elapsedSeconds, t)}
            </Text>
          </View>

          {selectedGroup ? (
            <View
              style={[
                styles.membersCard,
                { backgroundColor: colors.panel, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.membersTitle, { color: colors.accent }]}>
                {t("whoIsComing")}
              </Text>
              <ScrollView
                style={styles.membersList}
                contentContainerStyle={styles.membersListContent}
              >
                {selectedGroup.contacts.map((contact, index) => {
                  const isLast = index === selectedGroup.contacts.length - 1;

                  return (
                    <View
                      key={contact.id}
                      style={[
                        styles.memberRow,
                        !isLast && {
                          borderBottomWidth: StyleSheet.hairlineWidth,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.memberName, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {contactDisplayName(contact)}
                      </Text>
                      <Text
                        style={[styles.memberStatus, { color: colors.accent }]}
                      >
                        {t("onTheWay")}
                      </Text>
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("cancel")}
            onPress={requestCancelSignal}
            style={({ pressed }) => [
              styles.cancelButton,
              {
                backgroundColor: colors.panel,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.cancelLabel, { color: colors.text }]}>
              {t("cancel")}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.selectors}>
            <Dropdown
              label={t("selectGroup")}
              placeholder={t("chooseGroup")}
              options={groupOptions}
              value={selectedGroupId}
              open={openDropdown === "group"}
              onOpenChange={(open) => setOpenDropdown(open ? "group" : null)}
              onChange={setSelectedGroupId}
              colors={colors}
            />

            <Dropdown
              label={t("selectLocation")}
              placeholder={t("chooseLocation")}
              options={locationOptions}
              value={selectedLocationId}
              open={openDropdown === "location"}
              onOpenChange={(open) => setOpenDropdown(open ? "location" : null)}
              onChange={setSelectedLocationId}
              colors={colors}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("activateBarSignal")}
            onPress={activateSignal}
            style={({ pressed }) => [
              styles.signalButton,
              {
                borderColor: colors.white,
                backgroundColor: colors.accent,
              },
              pressed && styles.signalButtonPressed,
            ]}
          >
            <BarStool stoolColor={colors.stool} />
          </Pressable>
        </>
      )}

      <Modal
        visible={confirmCancelVisible}
        transparent
        animationType="fade"
        onRequestClose={dismissCancelConfirmation}
      >
        <View
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: colors.panel, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.accent }]}>
              {t("cancelSignalTitle")}
            </Text>
            <Text style={[styles.modalMessage, { color: colors.text }]}>
              {t("cancelSignalMessage")}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                accessibilityRole="button"
                onPress={dismissCancelConfirmation}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.modalButtonLabel, { color: colors.text }]}>
                  {t("keepSignal")}
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                onPress={confirmCancelSignal}
                style={({ pressed }) => [
                  styles.modalButton,
                  {
                    backgroundColor: "#8B1E1E",
                    borderColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[styles.modalButtonLabel, { color: colors.white }]}
                >
                  {t("stopSignal")}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function BarStool({ stoolColor }: { stoolColor: string }) {
  return (
    <View style={styles.stool}>
      <View style={[styles.seatTop, { backgroundColor: stoolColor }]} />
      <View style={[styles.seat, { backgroundColor: stoolColor }]} />
      <View style={[styles.pole, { backgroundColor: stoolColor }]} />
      <View style={[styles.footrest, { backgroundColor: stoolColor }]} />
      <View style={[styles.base, { backgroundColor: stoolColor }]} />
    </View>
  );
}

const SIGNAL_SIZE = 220;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  welcome: {
    fontSize: 18,
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 28,
    textAlign: "center",
  },
  selectors: {
    width: "100%",
    maxWidth: 360,
    gap: 16,
    marginBottom: 36,
    zIndex: 1,
  },
  activeSignal: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    gap: 20,
  },
  timerBlock: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  headingTo: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  timerValue: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
  },
  membersCard: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingTop: 14,
    paddingBottom: 4,
    maxHeight: 260,
  },
  membersTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  membersList: {
    width: "100%",
  },
  membersListContent: {
    paddingBottom: 8,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  memberStatus: {
    fontSize: 13,
    fontWeight: "700",
  },
  cancelButton: {
    minHeight: 48,
    minWidth: 180,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalSheet: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  modalButtonLabel: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  signalButton: {
    width: SIGNAL_SIZE,
    height: SIGNAL_SIZE,
    borderRadius: SIGNAL_SIZE / 2,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  signalButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  stool: {
    width: 88,
    height: 128,
    alignItems: "center",
  },
  seatTop: {
    width: 64,
    height: 10,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  seat: {
    width: 72,
    height: 14,
    borderRadius: 6,
    marginTop: -2,
  },
  pole: {
    width: 10,
    flex: 1,
    marginTop: -1,
    marginBottom: -1,
  },
  footrest: {
    position: "absolute",
    top: 70,
    width: 52,
    height: 10,
    borderRadius: 5,
  },
  base: {
    width: 64,
    height: 12,
    borderRadius: 6,
  },
});
