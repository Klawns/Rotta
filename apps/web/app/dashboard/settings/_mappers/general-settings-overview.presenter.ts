interface GeneralSettingsOverviewPresentationOptions {
  activePresetCount: number;
}

export function getGeneralSettingsOverviewPresentation({
  activePresetCount,
}: GeneralSettingsOverviewPresentationOptions) {
  const activeCountLabel =
    activePresetCount === 1
      ? '1 atalho ativo'
      : `${activePresetCount} atalhos ativos`;

  return {
    title: 'Atalhos do painel',
    description: 'Salve valor e local para preencher corridas mais rapido.',
    primaryActionLabel:
      activePresetCount === 0 ? 'Criar primeiro atalho' : 'Criar novo atalho',
    activeCountLabel,
    activeCountValue: String(activePresetCount),
  };
}
