import { HeaderTitle, HeaderRight, commonHeaderScreenOptions } from "./AppHeader";

export function buildCommonHeaderOptions(params: {
  title: string;
  onCreate?: () => void;
  rightLabel?: string;
}) {
  const { title, onCreate, rightLabel } = params;
  return {
    ...commonHeaderScreenOptions,
    headerTitle: () => <HeaderTitle title={title} />,
    headerRight: () => <HeaderRight onPressCreate={onCreate} rightLabel={rightLabel} />,
  };
}
