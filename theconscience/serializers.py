from django.contrib.auth.models import User, Group
from martial.models import MartialArt, TAG_CHOICES
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):
    """docstring for UserSerializer"""

    class Meta:
        model = User
        fields = ('url', 'username', 'email', 'groups')


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    """docstring for GroupSerializer"""

    class Meta:
        model = Group
        fields = ('url', 'name')


class MartialArtSerializer(serializers.HyperlinkedModelSerializer):
    """docstring for GroupSerializer"""

    class Meta:
        model = MartialArt
        fields = ('url', 'title', 'description', 'hashtag', 'art_type', 'country')


class MartialArtModelSerializer(serializers.ModelSerializer):
    """docstring for GroupSerializer"""

    class Meta:
        model = MartialArt
        fields = ('id', 'title', 'description', 'hashtag', 'art_type', 'country')


class MartialArtDumbSerializer(serializers.Serializer):
    pk = serializers.IntegerField(read_only=True)
    url = serializers.CharField(read_only=True)
    title = serializers.CharField(required=False, allow_blank=True, max_length=100)
    hashtag = serializers.ChoiceField(choices=TAG_CHOICES, default='weapon')
    # code = serializers.CharField(style={'base_template': 'textarea.html'})
    # linenos = serializers.BooleanField(required=False)
    # language = serializers.ChoiceField(choices=LANGUAGE_CHOICES, default='python')
    # style = serializers.ChoiceField(choices=STYLE_CHOICES, default='friendly')

    def create(self, validated_data):
        """
        Create and return a new `Snippet` instance, given the validated data.
        """
        return MartialArt.objects.create(**validated_data)

    def update(self, instance, validated_data):
        """
        Update and return an existing `Snippet` instance, given the validated data.
        """
        instance.title = validated_data.get('title', instance.title)
        instance.code = validated_data.get('hashtag', instance.hashtag)
        # instance.linenos = validated_data.get('linenos', instance.linenos)
        # instance.language = validated_data.get('language', instance.language)
        # instance.style = validated_data.get('style', instance.style)
        instance.save()
        return instance