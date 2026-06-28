import urllib.request
import json
import sys

repo = "Auro450/Taja_cart_frontend-"
runs_url = f"https://api.github.com/repos/{repo}/actions/runs"

try:
    req = urllib.request.Request(runs_url)
    with urllib.request.urlopen(req) as response:
        runs_data = json.loads(response.read().decode())
        
    latest_run = runs_data['workflow_runs'][0]
    run_id = latest_run['id']
    print(f"Latest Run ID: {run_id}")
    
    jobs_url = f"https://api.github.com/repos/{repo}/actions/runs/{run_id}/jobs"
    req_jobs = urllib.request.Request(jobs_url)
    with urllib.request.urlopen(req_jobs) as response:
        jobs_data = json.loads(response.read().decode())
        
    for job in jobs_data['jobs']:
        print(f"Job: {job['name']} - Status: {job['status']} - Conclusion: {job['conclusion']}")
        if job['conclusion'] == 'failure':
            job_id = job['id']
            print(f"Fetching logs for failed job {job_id}...")
            log_url = f"https://api.github.com/repos/{repo}/actions/jobs/{job_id}/logs"
            try:
                req_log = urllib.request.Request(log_url)
                with urllib.request.urlopen(req_log) as log_response:
                    logs = log_response.read().decode()
                    print("\n--- LAST 100 LINES OF LOG ---")
                    lines = logs.split('\n')
                    print('\n'.join(lines[-100:]))
            except Exception as e:
                print(f"Could not fetch logs directly (might need auth for raw logs): {e}")
                
except Exception as e:
    print(f"Error: {e}")
