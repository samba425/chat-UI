import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Observable } from 'rxjs';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings-dashboard',
  templateUrl: './settings-dashboard.component.html',
  styleUrls: ['./settings-dashboard.component.css'],
      standalone: false
})
export class SettingsDashboardComponent implements OnInit {
  settingsForm: FormGroup;
  isDarkMode$: Observable<boolean>;

  initialData = `
WEAVIATE_URL="http://localhost:8080"
WEAVIATE_API_KEY=None
EMBEDDER=text-embedding-3-large
RERANKER=none
EVAL_FILE=evals.json
EVAL_TOP_K=5
BENCH_OUT=benchmark_results.json
DOCS_DIR=Device_8000
LOG_LEVEL=DEBUG
OPENAI_API_KEY=""
OPENAI_API_URL=https://cxai-playground.cisco.com
GPT_MODEL=gpt-4.1
CISCO_OPENAI_APP_KEY=""
CISCO_BRAIN_USER_ID=
CLIENT_ID=
CLIENT_SECRET=
TOKEN_URL=https://id.cisco.com/oauth2/default/v1/token
FIRST_START_ELYSIA='1'
  `;

  constructor(private fb: FormBuilder, private themeService: ThemeService) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.settingsForm = this.fb.group({
      envVars: this.fb.array([])
    });
  }

  ngOnInit() {
    this.parseInitialData();
  }

  get envVars() {
    return this.settingsForm.get('envVars') as FormArray;
  }

  parseInitialData() {
    const lines = this.initialData.trim().split('\n');
    lines.forEach(line => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=');
        this.envVars.push(this.createEnvVarGroup(key.trim(), value.trim()));
      }
    });
  }

  createEnvVarGroup(key: string, value: string): FormGroup {
    return this.fb.group({
      key: [key],
      value: [value]
    });
  }

  addEnvVar() {
    this.envVars.push(this.createEnvVarGroup('', ''));
  }

  removeEnvVar(index: number) {
    this.envVars.removeAt(index);
  }

  save() {
    console.log(this.settingsForm.value.envVars);
  }
}
