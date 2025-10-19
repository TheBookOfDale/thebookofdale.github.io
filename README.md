# The Book of Dale

A technically rigorous, visually polished blog for analytics leaders and enablement professionals.  
Built with Jekyll and a customized Chirpy theme, this site explores Power BI strategy, SQL modeling, operational systems, and scalable branding for enterprise reporting.

📍 Live site: [https://thebookofdale.github.io](https://thebookofdale.github.io)

---

## ✨ Features

- ✍️ Long-form posts on analytics leadership, Power BI, and operational systems  
- 🧱 Series structure for foundational topics (e.g., Manufacturing Analytics Foundations)  
- 🎨 Custom branding with reusable icons, backgrounds, and color systems  
- 📅 SEO-optimized structured data (BlogPosting, FAQPage)  
- ⚙️ PowerShell automation for local development and Jekyll server management  
- 🧠 Technical writing refined for clarity, discoverability, and professional impact  

---

## 🚀 Getting Started

To run the site locally:

```bash
git clone https://github.com/your-username/thebookofdale.github.io.git
cd thebookofdale.github.io
bundle install
bundle exec jekyll serve
```

For local automation, see the [PowerShell Toolkit](#powershell-toolkit) section below.

---

## 🗂️ Folder Structure

```text
assets/
└── images/
    ├── posts/        # One folder per post
    ├── series/       # Shared visuals for post series
    ├── shared/       # Logos, icons, backgrounds
    └── uploads/      # Optional scratch space

_includes/            # Reusable layout components
_layouts/             # Page and post templates
_posts/               # Markdown blog posts
_data/                # Author and locale metadata
_config.yml           # Site configuration
```

---

## 📦 Dependencies

- Ruby + Bundler  
- Jekyll  
- Chirpy theme (customized)  
- Font Awesome  
- GitHub Pages  

---

## 🛠️ PowerShell Toolkit

You can also use custom PowerShell functions (defined in your profile) to manage the Jekyll server:

- `jserve` — start Jekyll server as a background job  
- `jstop` — stop the server  
- `jrestart` — restart cleanly  
- `jstatus` — check if Jekyll is running  

These functions store the job ID in a temporary file and allow you to control the server without blocking your terminal. They’re especially useful when working in VS Code or managing multiple local environments.

---

## 💬 Feedback

This site is continuously evolving.  
If you spot an issue, have a suggestion, or want to collaborate, feel free to reach out via [LinkedIn](https://www.linkedin.com/in/christopherdale) or open an issue in the repo.

---

## 🧠 Author

**Christopher Dale**  
Manager, Data Analytics & Operational Systems  
MS Information Systems (Business Intelligence & Digital Transformation)  
Le Moyne College, Syracuse, NY  
Specializing in Power BI strategy, SQL modeling, operational systems, and scalable analytics enablement.  
[LinkedIn](https://www.linkedin.com/in/christopherdale) • [GitHub](https://github.com/your-username)

---

## 📄 License

This project is licensed under the MIT License.  
See the [LICENSE](LICENSE) file for full details.