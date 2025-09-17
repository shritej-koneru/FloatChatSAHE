# FloatChat: An AI-Powered Conversational Interface for ARGO Ocean Data

**FloatChat** is a groundbreaking conversational AI tool designed to demystify vast and complex oceanographic data, making it accessible to a wide audience, from seasoned domain experts to curious general users. The project leverages cutting-edge AI, including Large Language Models (LLMs), in conjunction with structured databases and interactive dashboards to enable effortless data exploration and visualization of information from the global ARGO program.

The core mission of FloatChat is to bridge the gap between non-technical users and raw scientific data by allowing them to extract meaningful insights using natural language.

---

## 🌊 Key Features

* **Intuitive Natural Language Interface**: Users can pose questions in everyday language, such as "Show me salinity profiles near the equator in March 2023" or "Compare BGC parameters in the Arabian Sea for the last 6 months," and the system will provide an intelligent response.
* **Rich Interactive Visualizations**: The tool features an interactive dashboard with geospatial maps that display ARGO float locations and trajectories. Dynamic plots of temperature, salinity, and biogeochemical (BGC) variables over depth and time are updated in real-time based on user queries.
* **Comprehensive Data Management**: FloatChat is built on a robust pipeline that ingests ARGO NetCDF files and converts them into structured formats like SQL and Parquet. It also uses a vector database to store metadata and summaries for efficient retrieval.
* **Easy Data Export**: The interface includes simple options to export data as CSV, Excel, or NetCDF for further offline analysis.

---

## 🛠️ Technical Workflow

The FloatChat system operates through a sophisticated, multi-agent architecture that orchestrates the flow of data and queries.

### **ARGO Data Discovery Workflow**

1.  **Data Acquisition**: The process begins with the collection of raw ARGO NetCDF files and metadata from various global and regional repositories, including the Argo Global Data Assembly Centre (GDAC) and the Indian National Centre for Ocean Information Services (INCOIS).
2.  **Data Preprocessing & Conversion**: The ingested NetCDF data is then parsed, validated for quality control, and converted into a structured relational database (PostgreSQL) and a vector database (FAISS/Chroma).
3.  **LLM & RAG Backend**: The system employs a Retrieval-Augmented Generation (RAG) pipeline powered by a multimodal LLM to interpret natural language queries and translate them into database commands. This allows for a deep understanding of user intent.
4.  **Visualization & Dashboard**: Once a query is processed, the system generates interactive geospatial maps and plots using tools like Plotly, Leaflet, and Streamlit, which are displayed on a modern web dashboard.
5.  **User Interface**: A responsive and intuitive chat interface handles the dialogue, guiding the user through data discovery and exploration.

### **Multi-Agent System**

The technical workflow is managed by several specialized agents, each handling a specific task:

* **Data Acquisition Agent**: Responsible for downloading raw ARGO data from source repositories.
* **Data Preprocessing & Conversion Agent**: Parses and converts the NetCDF data into a usable format.
* **Database Loader & Vector Indexing Agent**: Loads the structured data into PostgreSQL and indexes metadata in a vector database.
* **Orchestration & Controller Agent**: Acts as the central hub, interpreting queries and routing them to the appropriate agents.
* **Data Retrieval Agent**: Executes queries against the databases to fetch specific profiles and trajectories.
* **Analytics & Summarization Agent**: Runs computations and provides LLM-based summaries of the data.
* **Visualization Agent**: Creates the interactive plots and maps for the dashboard.
* **Conversational Frontend Agent**: Manages the web user interface and the interaction flow.
* **Cloud Deployment & Monitoring Agent**: Deploys the entire system on cloud platforms like Google Cloud and Streamlit Cloud.

---

## 📈 Example Interface Layout

The FloatChat interface is designed to be clean, modern, and responsive, ensuring a seamless user experience. It features a three-panel layout to keep all key functionalities easily accessible:

* **Left Panel (Chatbot Panel)**: Houses the chat history, sample queries, and the main text input box.
* **Main Panel (Visualization Dashboard)**: This is the central workspace, featuring an interactive map at the top, dynamic plots below it, and a clean tabular view of the data.
* **Right Panel (Sidebar/Toolbar)**: Contains filters for refining queries, along with buttons for exporting data and a help/documentation section.


---

## 📚 Data Sources

* **Argo Global Data Repository (ftp.ifremer.fr/ifremer/argo)**: The primary global data hub for the ARGO program, hosting standardized NetCDF files containing float profiles, metadata, and trajectories. It serves as a crucial resource for global ocean data.
* **INCOIS In-Situ Data ([https://incois.gov.in/OON/index.jsp](https://incois.gov.in/OON/index.jsp))**: This Indian data center provides extensive oceanographic data from the Indian Ocean, including information on sea surface temperature, chlorophyll, and other key variables, supporting regional research and operational services.

---

## 🌐 Languages and Tools

**Languages:**
* Python
* SQL
* JavaScript (ReactJS, PlotlyJS, LeafletJS)
* TypeScript

**Tools:**
* AutoGen
* Streamlit
* Google Cloud Console
* FAISS/Chroma DB
* PostgreSQL
