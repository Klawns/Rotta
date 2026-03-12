Especificações de Design - Dashboard
Este documento detalha as fontes, cores e estilos utilizados no Dashboard do sistema Mohamed Delivery Control, juntamente com a localização exata de cada definição no código-fonte.

1. Fontes (Typography)
As fontes são configuradas no arquivo 
app/layout.tsx
 através do sistema next/font.

Elemento	Fonte	Variável CSS	Uso
Principal	Inter	--font-inter	Fonte padrão para todo o sistema (textos, botões, labels).
Títulos	Montserrat	--font-montserrat	Usada em elementos de destaque e títulos (H1, H2).
2. Paleta de Cores (Colors)
O sistema utiliza o formato OKLCH para definições de cores, localizado no arquivo principal de estilos: 
app/globals.css
.

Cores Base do Sistema
Categoria	Valor OKLCH	Cor Aproximada	Localização
Fundo (Background)	oklch(0.12 0.01 260)	Navy Escuro (Slate 950)	
globals.css
 (--background)
Texto (Foreground)	oklch(0.95 0 0)	Off-White (Slate 50)	
globals.css
 (--foreground)
Cor Primária	oklch(0.65 0.2 145)	Verde Esmeralda Vibrante	
globals.css
 (--primary)
Bordas	oklch(0.28 0.01 260)	Cinza Azulado Escuro	
globals.css
 (--border)
3. Estilos Específicos do Dashboard
Estes estilos são aplicados diretamente nos componentes do Dashboard (
app/dashboard/page.tsx
).

Elementos de Interface
Elemento	Estilo / Classe Tailwind	Cor/Efeito
Fundo da Página	bg-slate-950	Slate 950 (Fundo sólido escuro).
Cards (Container)	bg-slate-900/40	Slate 900 com 40% de opacidade (Efeito Glass).
Borda dos Cards	border-white/5	Branco com 5% de opacidade (Subtil).
Botões Ativos	bg-blue-600	Azul Royal.
Botões Inativos	bg-white/5	Cinza muito escuro translúcido.
Tipografia no Dashboard
Elemento	Fonte / Estilo	Cor
Títulos (H1, H2)	font-bold	text-white (Branco puro).
Texto Mudo / Labels	font-medium	text-slate-400 (Cinza Misto).
Status "OK"	font-extrabold	text-emerald-400 (Verde Neon).
Ícones (Lucide React)
Os ícones utilizam cores variadas para categorização:

Corridas: text-blue-400 (Azul) ou text-orange-400 (Laranja).
Faturamento: text-violet-400 (Violeta).
Clientes: text-emerald-400 (Esmeralda).
4. Gráficos (Recharts)
Definido em 
components/dashboard/rides-chart.tsx
.

Linha do Gráfico: #10b981 (Green 500).
Preenchimento Gradient: #10b981 com opacidade de 30% diminuindo até 0%.
Tooltip: bg-slate-900 com borda border-white/10.