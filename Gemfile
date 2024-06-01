source "https://rubygems.org"

git_source(:github) { |repo_name| "https://github.com/#{repo_name}" }

# Specify your gem's dependencies in simple_discussion.gemspec
gemspec

gem "standardrb"

gem "devise"
gem "puma"
gem "sqlite3", "~> 1.4"

group :development, :test do
  # Adds support for debug
  gem "debug"
  gem "erb_lint", require: false
  gem "appraisal"
end
