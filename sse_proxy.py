from flask import Flask, request, Response
from flask_cors import CORS
import requests

app = Flask(__name__)
# This will allow your Angular app (running on a different port) to call this server
CORS(app) 

# The URL of your actual microservice
# TARGET_URL = 'http://10.196.209.153:8001/api/v1/troubleshooting/query/'
TARGET_URL = 'http://localhost:8012/api/v1/troubleshooting/query/'

@app.route('/api/v1/troubleshooting/query/', methods=['POST'])
def proxy_request():
    # Get the original request data and headers from the Angular app
    data = request.get_json()
    auth_header = request.headers.get('Authorization')

    headers = {
        'Authorization': auth_header,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream' # Tell the target server we can handle a stream
    }

    # Make a streaming request to the target microservice
    try:
        target_response = requests.post(TARGET_URL, json=data, headers=headers, stream=True)
        target_response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
    except requests.exceptions.RequestException as e:
        # Handle connection errors or bad responses from the target server
        print(f"Error connecting to target server: {e}")
        return Response(f"Error: Could not connect to the backend service. {e}", status=502)


    def generate_stream():
        """
        A generator function that reads the stream from the target server
        and yields it chunk by chunk to the client.
        """
        try:
            # Iterate over the content from the target server in chunks
            for chunk in target_response.iter_content(chunk_size=1024):
                if chunk:
                    # Format the chunk as an SSE message and yield it
                    # The client will receive these as individual 'message' events
                    sse_formatted_chunk = f"data: {chunk.decode('utf-8')}\n\n"
                    yield sse_formatted_chunk
        except Exception as e:
            print(f"An error occurred during streaming: {e}")
        finally:
            # Ensure the response from the target server is closed
            target_response.close()

    # Return a streaming response to the Angular client
    # The mimetype 'text/event-stream' is crucial for SSE
    return Response(generate_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    # Running on port 5001 to avoid conflicts with your other services
    app.run(host='0.0.0.0', port=5001, debug=True)
