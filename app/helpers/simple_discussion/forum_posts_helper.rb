require 'redcarpet'
class CustomRenderer < Redcarpet::Render::HTML
  def image(url, title, alt_text)
    case alt_text
    when 'Circuit'
      "<iframe src=\"#{url}\" width=\"540\" height=\"300\" frameborder=\"0\"></iframe><br>"
    when 'Video'
      video_id = url.split('v=')[1].split('&')[0]
      "<iframe width=\"300\" height=\"200\" src=\"https://www.youtube.com/embed/#{video_id}\" frameborder=\"0\" allowfullscreen></iframe><br>"
    else
      # default image rendering
      "<img src=\"#{url}\" alt=\"#{alt_text}\" title=\"#{title}\"><br>"
    end
  end

  # Add a method for user mentions (optional)
  def link(link, _title, content)
    if link.start_with?('https://circuitverse.org/users/', 'http://localhost:3000/users/')
      uri = URI.parse(link)
      uri.path =~ %r{^/users/\d+/?$}
      # remove the brackets from the content
      content = content.gsub(/[()]/, '')
      "<a class='tag-user' target='_blank' href=\"#{link}\">#{content}</a>"
    else
      "<a href=\"#{link}\">#{content}</a>"
    end
  end
end

module SimpleDiscussion::ForumPostsHelper
  def category_link(category)
    link_to category.name, simple_discussion.forum_category_forum_threads_path(category),
      style: "color: #{category.color}"
  end

  # Override this method to provide your own content formatting like Markdown
  def formatted_content(text)
    options = {
      hard_wrap: true,
      filter_html: true,
      autolink: true,
      tables: true
    }

    renderer = CustomRenderer.new
    markdown = Redcarpet::Markdown.new(renderer, options)
    markdown.render(text).html_safe
  end

  def forum_post_classes(forum_post)
    klasses = ["forum-post", "card", "mb-3"]
    klasses << "solved" if forum_post.solved?
    klasses << "original-poster" if forum_post.user == @forum_thread.user
    klasses
  end

  def forum_user_badge(user)
    if user.respond_to?(:moderator) && user.moderator?
      content_tag :span, "Mod", class: "badge badge-default"
    end
  end

  def gravatar_url_for(email, **options)
    hash = Digest::MD5.hexdigest(email&.downcase || "")
    options.reverse_merge!(default: :mp, rating: :pg, size: 48)
    "https://secure.gravatar.com/avatar/#{hash}.png?#{options.to_param}"
  end
end
