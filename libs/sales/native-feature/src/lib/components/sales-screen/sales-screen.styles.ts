import { StyleSheet } from 'react-native';
import { useSharedStyles } from '@pos/theme/native';
import { useDesignTokens } from '@pos/theme/native/design-tokens';

export const useSalesScreenStyles = () => {
    const sharedStyles = useSharedStyles();
    const tokens = useDesignTokens();

    return {
        ...sharedStyles,
        ...StyleSheet.create({
            salesLayout: {
                flex: 1,
                flexDirection: 'row',
                alignItems: 'stretch',
            },
            categoriesCardWrap: {
                overflow: 'hidden',
                flexShrink: 0,
            },
            categoriesCard: {
                flex: 1,
                overflow: 'hidden',
            },
            productsCard: {
                flex: 1,
                minWidth: 0,
                marginRight: tokens.spacing.sm,
            },
            productsHeader: {
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: tokens.spacing.sm,
            },
            productsHeaderCopy: {
                flexShrink: 1,
                minWidth: 0,
                paddingRight: tokens.spacing.sm,
            },
            productsHeaderActions: {
                flexDirection: 'row',
                alignItems: 'center',
                gap: tokens.spacing.xs,
                marginLeft: tokens.spacing.md,
            },
            sectionTitleRow: {
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 4,
                marginLeft: -6,
            },
            sectionTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 20,
                fontWeight: '700',
            },
            sectionSubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 13,
                maxWidth: 360,
            },
            toggleIconButton: {
                borderRadius: tokens.radii.xl,
                width: 36,
                height: 36,
                minWidth: 36,
                minHeight: 36,
                paddingHorizontal: 0,
                paddingVertical: 0,
                marginRight: 2,
            },
            currentDealsButton: {
                borderRadius: tokens.radii.xl,
                borderColor: tokens.colors.accent,
                paddingHorizontal: tokens.spacing.sm,
                minHeight: 36,
            },
            currentDealsTitle: {
                color: tokens.colors.accent,
                fontSize: 13,
                fontWeight: '700',
                marginLeft: 6,
            },
            emptyCatalogWrap: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: tokens.spacing.xl,
                paddingBottom: tokens.spacing.lg,
            },
            emptyTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 24,
                fontWeight: '700',
                marginBottom: tokens.spacing.xs,
            },
            emptySubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 15,
                lineHeight: 22,
                textAlign: 'center',
                maxWidth: 420,
                marginBottom: tokens.spacing.lg,
            },
            emptyActions: {
                flexDirection: 'row',
                gap: tokens.spacing.sm,
            },
            primaryAction: {
                backgroundColor: tokens.colors.accent,
                borderRadius: tokens.radii.xl,
                paddingHorizontal: tokens.spacing.md,
                minHeight: 46,
            },
            primaryActionTitle: {
                color: '#ffffff',
                fontWeight: '700',
                marginLeft: 8,
            },
            secondaryAction: {
                borderRadius: tokens.radii.xl,
                borderColor: tokens.colors.accent,
                paddingHorizontal: tokens.spacing.md,
                minHeight: 46,
            },
            secondaryActionTitle: {
                color: tokens.colors.accent,
                fontWeight: '700',
                marginLeft: 8,
            },
            cartPanel: {
                width: 330,
                minWidth: 300,
            },
            dealsDialog: {
                width: 720,
                maxWidth: '92%',
                maxHeight: '88%',
            },
            dealsDialogTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 26,
                fontWeight: '700',
                marginBottom: tokens.spacing.xs,
            },
            dealsDialogSubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 14,
                lineHeight: 21,
                marginBottom: tokens.spacing.md,
            },
            dealsDialogScroll: {
                maxHeight: 520,
            },
            dealsDialogContent: {
                paddingBottom: tokens.spacing.sm,
            },
            dealsSection: {
                marginBottom: tokens.spacing.md,
            },
            dealsSectionTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 15,
                fontWeight: '700',
                marginBottom: tokens.spacing.sm,
            },
            dealsCard: {
                borderWidth: 1,
                borderColor: tokens.colors.border,
                backgroundColor: tokens.colors.surfaceMuted,
                borderRadius: tokens.radii.lg,
                paddingHorizontal: tokens.spacing.md,
                paddingVertical: tokens.spacing.sm,
                marginBottom: tokens.spacing.sm,
            },
            dealsBadgeRow: {
                flexDirection: 'row',
                marginBottom: tokens.spacing.xs,
            },
            dealsBadge: {
                backgroundColor: tokens.colors.surface,
                borderRadius: tokens.radii.xl,
                paddingHorizontal: tokens.spacing.sm,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: tokens.colors.border,
            },
            dealsBadgeText: {
                color: tokens.colors.textSecondary,
                fontSize: 11,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
            },
            dealsTitle: {
                color: tokens.colors.textPrimary,
                fontSize: 17,
                fontWeight: '700',
                marginBottom: 4,
            },
            dealsSubtitle: {
                color: tokens.colors.textSecondary,
                fontSize: 13,
                lineHeight: 20,
            },
            dealsDialogFooter: {
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: tokens.spacing.sm,
            },
        }),
    };
};

export type SalesScreenStyles = ReturnType<typeof useSalesScreenStyles>;
