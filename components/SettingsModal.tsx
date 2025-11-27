import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Switch,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { colors } from '../constants/colors';

interface SettingsModalProps {
    visible: boolean;
    onClose: () => void;
}

// 픽셀 스타일 박스 컴포넌트
const PixelBox: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => (
    <View style={[pixelStyles.boxOuter, style]}>
        <View style={pixelStyles.boxInner}>
            {children}
        </View>
    </View>
);

// 픽셀 스타일 버튼 컴포넌트
const PixelButton: React.FC<{
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'danger';
}> = ({ title, onPress, variant = 'primary' }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[
            pixelStyles.buttonOuter,
            variant === 'danger' && pixelStyles.buttonOuterDanger
        ]}>
            <View style={[
                pixelStyles.buttonInner,
                variant === 'danger' && pixelStyles.buttonInnerDanger
            ]}>
                <Text style={[
                    pixelStyles.buttonText,
                    variant === 'danger' && pixelStyles.buttonTextDanger
                ]}>
                    {title}
                </Text>
            </View>
        </View>
    </TouchableOpacity>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
    const {
        settings,
        updateSettings,
        quota,
        resetDailyQuota,
        getTodayParticipants,
        resetTodayParticipants
    } = useGameStore();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <PixelBox style={styles.modalContainer}>
                    {/* 헤더 */}
                    <View style={styles.header}>
                        <Text style={styles.headerText}>설정</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 설정 목록 */}
                    <View style={styles.content}>
                        {/* 자동 중지 설정 */}
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>자동 중지</Text>
                                <Text style={styles.settingDesc}>상품 소진 시 자동 중지</Text>
                            </View>
                            <Switch
                                value={settings.autoStopOnEnd}
                                onValueChange={(value) => updateSettings({ autoStopOnEnd: value })}
                                trackColor={{ false: '#767577', true: colors.pixel.gold }}
                                thumbColor={settings.autoStopOnEnd ? colors.pixel.cream : '#f4f3f4'}
                            />
                        </View>

                        {/* 사운드 설정 */}
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>사운드</Text>
                                <Text style={styles.settingDesc}>배경음악 ON/OFF</Text>
                            </View>
                            <Switch
                                value={settings.soundEnabled}
                                onValueChange={(value) => updateSettings({ soundEnabled: value })}
                                trackColor={{ false: '#767577', true: colors.pixel.gold }}
                                thumbColor={settings.soundEnabled ? colors.pixel.cream : '#f4f3f4'}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* 뽑기 모드 설정 */}
                        <Text style={styles.sectionTitle}>뽑기 모드</Text>
                        <View style={styles.modeButtonGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.modeButton,
                                    settings.drawMode === 'timer' && styles.modeButtonActive
                                ]}
                                onPress={() => updateSettings({ drawMode: 'timer' })}
                            >
                                <Text style={[
                                    styles.modeButtonText,
                                    settings.drawMode === 'timer' && styles.modeButtonTextActive
                                ]}>
                                    타이머
                                </Text>
                                <Text style={styles.modeButtonDesc}>3초 자동 뽑기</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modeButton,
                                    settings.drawMode === 'card' && styles.modeButtonActive
                                ]}
                                onPress={() => updateSettings({ drawMode: 'card' })}
                            >
                                <Text style={[
                                    styles.modeButtonText,
                                    settings.drawMode === 'card' && styles.modeButtonTextActive
                                ]}>
                                    카드
                                </Text>
                                <Text style={styles.modeButtonDesc}>카드 선택 뽑기</Text>
                            </TouchableOpacity>
                        </View>

                        {/* 카드 수 설정 (카드 모드일 때만 표시) */}
                        {settings.drawMode === 'card' && (
                            <>
                                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>카드 수: {settings.cardCount}장</Text>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderLabel}>1</Text>
                                    <View style={styles.sliderTrack}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <TouchableOpacity
                                                key={num}
                                                style={[
                                                    styles.sliderDot,
                                                    settings.cardCount === num && styles.sliderDotActive
                                                ]}
                                                onPress={() => updateSettings({ cardCount: num })}
                                            >
                                                <Text style={[
                                                    styles.sliderDotText,
                                                    settings.cardCount === num && styles.sliderDotTextActive
                                                ]}>{num}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Text style={styles.sliderLabel}>10</Text>
                                </View>

                                <Text style={[styles.sectionTitle, { marginTop: 16 }]}>당첨 베이글 수: {settings.cardBagelCount}개</Text>
                                <View style={styles.sliderContainer}>
                                    <Text style={styles.sliderLabel}>1</Text>
                                    <View style={styles.sliderTrack}>
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                            <TouchableOpacity
                                                key={num}
                                                style={[
                                                    styles.sliderDot,
                                                    settings.cardBagelCount === num && styles.sliderDotActive
                                                ]}
                                                onPress={() => updateSettings({ cardBagelCount: num })}
                                            >
                                                <Text style={[
                                                    styles.sliderDotText,
                                                    settings.cardBagelCount === num && styles.sliderDotTextActive
                                                ]}>{num}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <Text style={styles.sliderLabel}>10</Text>
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        {/* 남은 상품 */}
                        <Text style={styles.sectionTitle}>남은 상품</Text>
                        <View style={styles.quotaContainer}>
                            <View style={styles.quotaItem}>
                                <Text style={styles.quotaLabel}>1등</Text>
                                <Text style={styles.quotaValue}>{quota.first}</Text>
                            </View>
                            <View style={styles.quotaItem}>
                                <Text style={styles.quotaLabel}>2등</Text>
                                <Text style={styles.quotaValue}>{quota.second}</Text>
                            </View>
                            <View style={styles.quotaItem}>
                                <Text style={styles.quotaLabel}>3등</Text>
                                <Text style={styles.quotaValue}>{quota.third}</Text>
                            </View>
                        </View>

                        {/* 오늘 참여자 */}
                        <View style={styles.participantsRow}>
                            <Text style={styles.participantsLabel}>오늘 참여자</Text>
                            <Text style={styles.participantsValue}>{getTodayParticipants()}명</Text>
                        </View>

                        <View style={styles.divider} />

                        {/* 리셋 버튼들 */}
                        <View style={styles.buttonGroup}>
                            <PixelButton
                                title="상품 수량 리셋"
                                onPress={resetDailyQuota}
                            />
                            <View style={{ height: 12 }} />
                            <PixelButton
                                title="오늘 참여자 리셋"
                                onPress={resetTodayParticipants}
                                variant="danger"
                            />
                        </View>
                    </View>
                </PixelBox>
            </View>
        </Modal>
    );
};

const pixelStyles = StyleSheet.create({
    boxOuter: {
        backgroundColor: colors.pixel.darkBrown,
        padding: 4,
        borderRadius: 2,
    },
    boxInner: {
        backgroundColor: colors.pixel.cream,
        borderWidth: 2,
        borderColor: colors.pixel.brown,
    },
    buttonOuter: {
        backgroundColor: colors.pixel.darkBrown,
        padding: 3,
        borderRadius: 2,
    },
    buttonOuterDanger: {
        backgroundColor: '#5C2E2E',
    },
    buttonInner: {
        backgroundColor: colors.pixel.gold,
        borderWidth: 2,
        borderColor: colors.pixel.orange,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    buttonInnerDanger: {
        backgroundColor: '#C45C5C',
        borderColor: '#8B3A3A',
    },
    buttonText: {
        color: colors.pixel.darkBrown,
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonTextDanger: {
        color: '#FFF8DC',
    },
});

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        width: '100%',
        maxWidth: 360,
    },
    header: {
        backgroundColor: colors.pixel.brown,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: colors.pixel.darkBrown,
    },
    headerText: {
        color: colors.pixel.cream,
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        width: 28,
        height: 28,
        backgroundColor: colors.pixel.darkBrown,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        color: colors.pixel.cream,
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        padding: 16,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(74, 55, 40, 0.2)',
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    settingDesc: {
        fontSize: 12,
        color: colors.pixel.brown,
        marginTop: 2,
    },
    divider: {
        height: 2,
        backgroundColor: colors.pixel.brown,
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.pixel.brown,
        marginBottom: 12,
    },
    quotaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    quotaItem: {
        alignItems: 'center',
        backgroundColor: colors.pixel.gold,
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderWidth: 2,
        borderColor: colors.pixel.darkBrown,
    },
    quotaLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    quotaValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    participantsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    participantsLabel: {
        fontSize: 14,
        color: colors.pixel.brown,
    },
    participantsValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.pixel.darkBrown,
    },
    buttonGroup: {
        marginTop: 8,
    },
    modeButtonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modeButton: {
        flex: 1,
        backgroundColor: colors.pixel.cream,
        borderWidth: 3,
        borderColor: colors.pixel.brown,
        paddingVertical: 12,
        paddingHorizontal: 8,
        alignItems: 'center',
    },
    modeButtonActive: {
        backgroundColor: colors.pixel.gold,
        borderColor: colors.pixel.darkBrown,
    },
    modeButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.pixel.brown,
    },
    modeButtonTextActive: {
        color: colors.pixel.darkBrown,
    },
    modeButtonDesc: {
        fontSize: 10,
        color: colors.pixel.brown,
        marginTop: 4,
    },
    sliderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        paddingHorizontal: 4,
    },
    sliderLabel: {
        fontSize: 12,
        color: colors.pixel.brown,
        fontWeight: 'bold',
        width: 20,
        textAlign: 'center',
    },
    sliderTrack: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 8,
    },
    sliderDot: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: colors.pixel.cream,
        borderWidth: 2,
        borderColor: colors.pixel.brown,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderDotActive: {
        backgroundColor: colors.pixel.gold,
        borderColor: colors.pixel.darkBrown,
    },
    sliderDotText: {
        fontSize: 10,
        color: colors.pixel.brown,
        fontWeight: 'bold',
    },
    sliderDotTextActive: {
        color: colors.pixel.darkBrown,
    },
});

export default SettingsModal;
