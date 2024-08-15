require "test_helper"
require "language_filter"

class ForumTest < ActionDispatch::IntegrationTest
  include ActionView::RecordIdentifier
  include SimpleDiscussion::Engine.routes.url_helpers

  setup do
    @regular_user = users(:one)
    @moderator_user = users(:moderator)
    @forum_thread = forum_threads(:hello)
    @forum_post = forum_posts(:hello)
    @filter = LanguageFilter::Filter.new
  end

  test "threads index" do
    sign_in @regular_user
    get "/"
    assert_response :success
    assert_match "Community", response.body
  end

  test "categories" do
    sign_in @regular_user
    get forum_category_forum_threads_path(forum_categories(:general))
    assert_response :success
  end

  test "show forum thread" do
    sign_in @regular_user
    get forum_thread_path(@forum_thread)
    assert_response :success
  end

  test "create a forum thread" do
    sign_in @regular_user
    assert_difference "ForumThread.count" do
      assert_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "Test Thread",
            forum_posts_attributes: [{
              body: "Hello test thread"
            }]
          }
        }
      end
    end

    assert_redirected_to forum_thread_path(ForumThread.last)
  end

  test "reply to a forum thread" do
    sign_in @regular_user
    assert_difference "ForumPost.count" do
      post forum_thread_forum_posts_path(@forum_thread), params: {
        forum_post: {
          body: "Reply"
        }
      }
    end

    assert_redirected_to forum_thread_path(forum_threads(:hello), anchor: dom_id(ForumPost.last))
  end

  test "cannot create a forum thread with inappropriate language in title" do
    sign_in @regular_user
    inappropriate_word = @filter.matchlist.to_a.sample
    assert_no_difference "ForumThread.count" do
      assert_no_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "This title contains inappropriate language: #{inappropriate_word}",
            forum_posts_attributes: [{
              body: "Clean body"
            }]
          }
        }
      end
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "contains inappropriate language: #{inappropriate_word}"
  end

  test "cannot create a forum thread with inappropriate language in body" do
    sign_in @regular_user

    inappropriate_word = @filter.matchlist.to_a.sample
    assert_no_difference "ForumThread.count" do
      assert_no_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "Clean Title",
            forum_posts_attributes: [{
              body: "contains inappropriate language: #{inappropriate_word}"
            }]
          }
        }
      end
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "contains inappropriate language: #{inappropriate_word}"
  end

  test "cannot reply to a forum thread with inappropriate language" do
    sign_in @regular_user

    inappropriate_word = @filter.matchlist.to_a.sample
    assert_no_difference "ForumPost.count" do
      post forum_thread_forum_posts_path(@forum_thread), params: {
        forum_post: {
          body: "contains inappropriate language: #{inappropriate_word}"
        }
      }
    end

    assert_response :unprocessable_entity
    assert_includes response.body, "contains inappropriate language: #{inappropriate_word}"
  end

  test "can create a forum thread with appropriate language in title and body" do
    sign_in @regular_user

    assert_difference "ForumThread.count" do
      assert_difference "ForumPost.count" do
        post forum_threads_path, params: {
          forum_thread: {
            forum_category_id: forum_categories(:general).id,
            title: "Clean Thread Title",
            forum_posts_attributes: [{
              body: "This is a clean and appropriate post."
            }]
          }
        }
      end
    end

    assert_redirected_to forum_thread_path(ForumThread.last)
  end

  test "can report a post" do
    sign_in @regular_user

    assert_difference "SpamReport.count" do
      post report_spam_forum_thread_forum_post_path(@forum_thread, @forum_post), params: {
        reason: "irrelevant_content"
      }
    end
    assert_redirected_to forum_thread_path(@forum_thread, anchor: dom_id(@forum_post))

    spam_report = SpamReport.last
    assert_equal @forum_post, spam_report.forum_post
    assert_equal @regular_user, spam_report.user
    assert_equal "irrelevant_content", spam_report.reason
  end

  test "can report a post with 'other' reason and details" do
    sign_in @regular_user

    assert_difference "SpamReport.count" do
      post report_spam_forum_thread_forum_post_path(@forum_thread, @forum_post), params: {
        reason: "others",
        details: "This post contains copyrighted material."
      }
    end

    assert_redirected_to forum_thread_path(@forum_thread, anchor: dom_id(@forum_post))

    spam_report = SpamReport.last
    assert_equal "others", spam_report.reason
    assert_equal "This post contains copyrighted material.", spam_report.details
  end

  test "modeartor can view spam reports page" do
    sign_in @moderator_user

    get spam_reports_forum_threads_path
    assert_response :success
  end

  test "regular user can't view spam reports page" do
    sign_in @regular_user

    get spam_reports_forum_threads_path
    assert_response :redirect
    assert_redirected_to root_path
  end
end
