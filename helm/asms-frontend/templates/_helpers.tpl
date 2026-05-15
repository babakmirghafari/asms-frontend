{{/*
Expand the name of the chart.
*/}}
{{- define "asms-frontend.name" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "asms-frontend.fullname" -}}
{{- .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "asms-frontend.labels" -}}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{ include "asms-frontend.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "asms-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "asms-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
